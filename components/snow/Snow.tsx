import { isSnowingInOsloToday } from "@/services/api/weather";
import SnowOverlay from "./SnowOverlay";

const Snow = async () => ((await isSnowingInOsloToday()) ? <SnowOverlay /> : null);

export default Snow;
