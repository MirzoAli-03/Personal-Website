/* Admin editor: rich text toolbar, slug preview, image upload + picker. */
(function () {
  var MAX_DIM = 1600;
  var QUALITY = 0.85;

  /* ---------- Client-side downscale ----------
     Keeps uploads well under Vercel's ~4.5MB body cap and shrinks what we
     store in Postgres. Falls back to the original file if anything fails. */
  function processImage(file) {
    return new Promise(function (resolve) {
      if (!/^image\//.test(file.type) || file.type === "image/gif") {
        return resolve({ blob: file, name: file.name, width: null, height: null });
      }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth;
        var h = img.naturalHeight;
        var scale = Math.min(1, MAX_DIM / Math.max(w, h));
        var tw = Math.round(w * scale);
        var th = Math.round(h * scale);

        var canvas = document.createElement("canvas");
        canvas.width = tw;
        canvas.height = th;
        canvas.getContext("2d").drawImage(img, 0, 0, tw, th);
        URL.revokeObjectURL(url);

        canvas.toBlob(
          function (blob) {
            if (!blob) return resolve({ blob: file, name: file.name, width: w, height: h });
            var name = file.name.replace(/\.[^.]+$/, "") + ".webp";
            resolve({ blob: blob, name: name, width: tw, height: th });
          },
          "image/webp",
          QUALITY
        );
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        resolve({ blob: file, name: file.name, width: null, height: null });
      };
      img.src = url;
    });
  }

  function uploadImage(file) {
    return processImage(file).then(function (out) {
      var fd = new FormData();
      fd.append("image", out.blob, out.name);
      if (out.width) fd.append("width", out.width);
      if (out.height) fd.append("height", out.height);
      fd.append("alt_text", "");
      return fetch("/admin/images", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      }).then(function (res) {
        if (!res.ok) return res.json().then(function (e) { throw new Error(e.error || "Upload failed"); });
        return res.json();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    /* ---------- Rich text toolbar ---------- */
    var editor = document.getElementById("editor");
    var bodyInput = document.getElementById("body-input");
    var htmlSource = document.getElementById("html-source");
    var form = document.querySelector(".editor-form");

    if (editor && form) {
      var toolbar = document.querySelector(".toolbar");

      toolbar.addEventListener("mousedown", function (e) {
        // Keep the caret in the editor when a toolbar button is pressed.
        if (e.target.closest("button")) e.preventDefault();
      });

      toolbar.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn) return;

        if (btn.dataset.cmd) {
          document.execCommand(btn.dataset.cmd, false, null);
        } else if (btn.dataset.block) {
          document.execCommand("formatBlock", false, btn.dataset.block);
        } else if (btn.hasAttribute("data-link")) {
          var url = window.prompt("Link URL", "https://");
          if (url) document.execCommand("createLink", false, url);
        } else if (btn.hasAttribute("data-insert-image")) {
          openPicker(function (id) {
            document.execCommand("insertHTML", false, '<img src="/images/' + id + '" alt="">');
          });
        } else if (btn.hasAttribute("data-toggle-html")) {
          toggleHtml(btn);
        }
        editor.focus();
        syncToolbarState();
      });

      function toggleHtml(btn) {
        if (htmlSource.hidden) {
          htmlSource.value = editor.innerHTML;
          htmlSource.hidden = false;
          editor.hidden = true;
          btn.classList.add("on");
        } else {
          editor.innerHTML = htmlSource.value;
          htmlSource.hidden = true;
          editor.hidden = false;
          btn.classList.remove("on");
        }
      }

      function syncToolbarState() {
        toolbar.querySelectorAll("button[data-cmd]").forEach(function (b) {
          try {
            b.classList.toggle("on", document.queryCommandState(b.dataset.cmd));
          } catch (err) {}
        });
      }
      editor.addEventListener("keyup", syncToolbarState);
      editor.addEventListener("mouseup", syncToolbarState);

      // The contenteditable div is not a form control — copy it into a hidden
      // input at submit time.
      form.addEventListener("submit", function () {
        bodyInput.value = htmlSource.hidden ? editor.innerHTML : htmlSource.value;
      });
    }

    /* ---------- Slug preview ---------- */
    var titleInput = document.getElementById("title");
    var slugInput = document.getElementById("slug");
    var slugPreview = document.getElementById("slug-preview");

    function slugify(s) {
      return s.toLowerCase()
        .normalize("NFKD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "").slice(0, 80);
    }

    if (titleInput && slugPreview) {
      function refreshSlug() {
        var value = slugInput && slugInput.value.trim()
          ? slugify(slugInput.value)
          : slugify(titleInput.value);
        slugPreview.textContent = value || "…";
      }
      titleInput.addEventListener("input", refreshSlug);
      if (slugInput) slugInput.addEventListener("input", refreshSlug);
      refreshSlug();
    }

    /* ---------- Cover image preview ---------- */
    var coverSelect = document.getElementById("cover-select");
    var coverPreview = document.getElementById("cover-preview");
    if (coverSelect && coverPreview) {
      coverSelect.addEventListener("change", function () {
        coverPreview.innerHTML = coverSelect.value
          ? '<img src="/images/' + coverSelect.value + '" alt="">'
          : "";
      });
    }

    /* ---------- Image picker modal ---------- */
    var picker = document.getElementById("image-picker");
    var pickerCallback = null;

    function openPicker(cb) {
      if (!picker) return;
      pickerCallback = cb;
      picker.hidden = false;
    }
    function closePicker() {
      if (!picker) return;
      picker.hidden = true;
      pickerCallback = null;
    }

    if (picker) {
      picker.addEventListener("click", function (e) {
        if (e.target.closest("[data-close-picker]")) return closePicker();

        var tile = e.target.closest(".image-tile");
        if (tile && pickerCallback) {
          pickerCallback(tile.dataset.imageId);
          closePicker();
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !picker.hidden) closePicker();
      });

      var pickerUpload = document.getElementById("picker-upload");
      var pickerStatus = document.getElementById("picker-status");
      if (pickerUpload) {
        pickerUpload.addEventListener("change", function () {
          var file = pickerUpload.files[0];
          if (!file) return;
          pickerStatus.textContent = "Uploading…";
          uploadImage(file)
            .then(function (res) {
              pickerStatus.textContent = "Uploaded.";
              if (pickerCallback) {
                pickerCallback(res.id);
                closePicker();
              }
            })
            .catch(function (err) {
              pickerStatus.textContent = err.message;
            });
          pickerUpload.value = "";
        });
      }
    }

    /* ---------- Library bulk upload ---------- */
    var libraryUpload = document.getElementById("library-upload");
    var uploadStatus = document.getElementById("upload-status");
    if (libraryUpload) {
      libraryUpload.addEventListener("change", function () {
        var files = Array.from(libraryUpload.files);
        if (!files.length) return;

        uploadStatus.hidden = false;
        uploadStatus.textContent = "Uploading " + files.length + " image(s)…";

        files.reduce(function (chain, file, i) {
          return chain.then(function () {
            uploadStatus.textContent = "Uploading " + (i + 1) + " of " + files.length + "…";
            return uploadImage(file);
          });
        }, Promise.resolve())
          .then(function () {
            uploadStatus.textContent = "Done. Reloading…";
            window.location.reload();
          })
          .catch(function (err) {
            uploadStatus.textContent = "Upload failed: " + err.message;
          });
      });
    }
  });
})();
