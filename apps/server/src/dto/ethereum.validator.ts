import { registerDecorator, type ValidationOptions, ValidatorConstraint, type ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: "isEthereumAddress", async: false })
export class IsEthereumAddressConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value !== "string") {
      return false;
    }
    // Validate Ethereum address format: 0x + 40 hex characters
    return /^0x[a-fA-F0-9]{40}$/.test(value);
  }

  defaultMessage() {
    return "Invalid Ethereum address format. Must be 0x followed by 40 hexadecimal characters";
  }
}

export function IsEthereumAddress(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEthereumAddressConstraint,
    });
  };
}
