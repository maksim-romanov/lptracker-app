import { container } from "../../../di/container";
import { POSITIONS_REPOSITORY, POSITIONS_SERVICE } from "./tokens";
import { PositionsRepository } from "../data/positions.repository";
import { PositionsService } from "../data/positions.service";

export function registerUniswapV3Feature() {
	container.register(POSITIONS_REPOSITORY, PositionsRepository);
	container.register(POSITIONS_SERVICE, PositionsService);
}
