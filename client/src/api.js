// Thin fetch wrapper. Always sends cookies so the JWT session travels with
// every request, and surfaces the server's error message rather than a status
// code the UI can't explain.
async function request(path, { method = "GET", body, isForm = false } = {}) {
  const options = {
    method,
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  };

  if (body !== undefined) {
    if (isForm) {
      options.body = body;
    } else {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`/api${path}`, options);

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response — fall through to the status-based error below.
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    // Known failures carry a code the UI can translate; message is the fallback.
    err.code = data?.code;
    err.missing = data?.missing;
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  login: (username, password) =>
    request("/login", { method: "POST", body: { username, password } }),
  logout: () => request("/logout", { method: "POST" }),
  me: () => request("/me"),

  // Public
  getSettings: () => request("/settings"),
  getPosts: (limit) => request(limit ? `/posts?limit=${limit}` : "/posts"),
  getPost: (slug) => request(`/posts/${encodeURIComponent(slug)}`),
  getProjects: ({ featured, limit } = {}) => {
    const params = new URLSearchParams();
    if (featured) params.set("featured", "true");
    if (limit) params.set("limit", String(limit));
    const qs = params.toString();
    return request(`/projects${qs ? `?${qs}` : ""}`);
  },

  // Admin — posts
  listAllPosts: () => request("/admin/posts"),
  getAdminPost: (id) => request(`/admin/posts/${id}`),
  createPost: (data) => request("/admin/posts", { method: "POST", body: data }),
  updatePost: (id, data) => request(`/admin/posts/${id}`, { method: "PUT", body: data }),
  deletePost: (id) => request(`/admin/posts/${id}`, { method: "DELETE" }),

  // Admin — projects
  getAdminProject: (id) => request(`/admin/projects/${id}`),
  createProject: (data) => request("/admin/projects", { method: "POST", body: data }),
  updateProject: (id, data) => request(`/admin/projects/${id}`, { method: "PUT", body: data }),
  deleteProject: (id) => request(`/admin/projects/${id}`, { method: "DELETE" }),

  // Admin — images
  listImages: () => request("/admin/images"),
  uploadImage: (formData) =>
    request("/admin/images", { method: "POST", body: formData, isForm: true }),
  deleteImage: (id) => request(`/admin/images/${id}`, { method: "DELETE" }),

  // Admin — settings
  updateSettings: (data) => request("/admin/settings", { method: "PUT", body: data }),
};

/* ---------- Image helpers ---------- */

const MAX_DIM = 1600;
const QUALITY = 0.85;

// Downscales in the browser so uploads stay under the serverless body limit
// and the database stays small. Falls back to the original on any failure.
export function processImage(file) {
  return new Promise((resolve) => {
    if (!/^image\//.test(file.type) || file.type === "image/gif") {
      return resolve({ blob: file, name: file.name, width: null, height: null });
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve({ blob: file, name: file.name, width: w, height: h });
          resolve({
            blob,
            name: file.name.replace(/\.[^.]+$/, "") + ".webp",
            width: w,
            height: h,
          });
        },
        "image/webp",
        QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ blob: file, name: file.name, width: null, height: null });
    };
    img.src = url;
  });
}

export async function uploadImageFile(file) {
  const out = await processImage(file);
  const fd = new FormData();
  fd.append("image", out.blob, out.name);
  if (out.width) fd.append("width", out.width);
  if (out.height) fd.append("height", out.height);
  fd.append("alt_text", "");
  return api.uploadImage(fd);
}
