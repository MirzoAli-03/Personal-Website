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
// public site and the admin panel cannot drift apart as options are added.
export default function SiteBackground() {
  const { settings } = useApp();
  const Background = BACKGROUNDS[settings?.background_style];
  return Background ? <Background /> : null;
}
