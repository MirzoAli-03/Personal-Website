import { useApp } from "../context/AppContext";
import MeshBackground from "./MeshBackground";
import ParticleNetwork from "./ParticleNetwork";
import ContourField from "./ContourField";
import HalftoneWave from "./HalftoneWave";
import FlowRibbons from "./FlowRibbons";
import AuroraBands from "./AuroraBands";

const BACKGROUNDS = {
  mesh: MeshBackground,
  particles: ParticleNetwork,
  contours: ContourField,
  halftone: HalftoneWave,
  ribbons: FlowRibbons,
  aurora: AuroraBands,
};

// Single place that maps the saved setting to a background component, so the
// public site, the admin panel and the mobile drawer cannot drift apart as
// options are added.
//
// `contained` fills the nearest positioned ancestor instead of the viewport —
// needed inside the drawer, where a fixed layer would sit behind the drawer's
// own scrim and never be seen.
export default function SiteBackground({ contained = false }) {
  const { settings } = useApp();
  const Background = BACKGROUNDS[settings?.background_style];
  return Background ? <Background contained={contained} /> : null;
}
