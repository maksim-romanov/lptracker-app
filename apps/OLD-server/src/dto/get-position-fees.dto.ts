import { IsNumberString } from "class-validator";

export class GetPositionFeesParamDto {
  @IsNumberString({}, { message: "Position ID must be a numeric string" })
  id!: string;
}
