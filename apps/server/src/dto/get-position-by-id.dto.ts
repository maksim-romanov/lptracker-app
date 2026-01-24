import { IsNumberString } from "class-validator";

export class GetPositionByIdParamDto {
  @IsNumberString({}, { message: "Position ID must be a numeric string" })
  id!: string;
}
