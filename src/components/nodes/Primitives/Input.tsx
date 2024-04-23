import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Info } from "lucide-react";
import type { Control, UseFormRegister } from "react-hook-form";

type InputPrimitiveProps = {
  control: Control;
  inputType: string;
  label: string;
  name: string;
  placeholder: string;
  description: string;
  register: UseFormRegister<any>;
  selectOptions?: {
    label: string;
    value: string;
  }[];
};

const SelectInput = ({
  control,
  name,
  placeholder,
  selectOptions,
  label,
  description,
}: InputPrimitiveProps) => (
  <FormItem>
    <FormLabel>{label}</FormLabel>
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {selectOptions?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
    {description && (
      <FormDescription>
        {description.split("\n").map((line, index) => (
          <p key={index} className={index === 0 ? "font-medium" : ""}>
            {line}
          </p>
        ))}
      </FormDescription>
    )}
    <FormMessage />
  </FormItem>
);

const DefaultInput = ({
  control,
  inputType,
  label,
  name,
  placeholder,
  description,
  register,
}: InputPrimitiveProps) => {
  const castInputValue = (value: string, inputType: string) => {
    switch (inputType) {
      case "number":
        return Number(value);
      case "boolean":
        return value === "true";
      default:
        return value;
    }
  };

  return (
    <FormItem>
      <TooltipProvider>
        <Tooltip>
          <FormLabel>{label}</FormLabel>
          <div className="flex items-center">
            <FormField
              name={name}
              control={control}
              render={({ field }) => (
                <Input
                  {...register(name)}
                  {...field}
                  type={inputType}
                  placeholder={placeholder}
                  className="w-full p-2"
                  onChange={(e) => {
                    field.onChange(castInputValue(e.target.value, inputType));
                  }}
                />
              )}
            />
            <TooltipTrigger>
              <Info size={16} className="ml-2 text-gray-400" />
            </TooltipTrigger>
          </div>
          {description && (
            <TooltipContent className="max-w-[200px]">
              <div className="flex flex-col gap-[2px]">
                {description.split("\n").map((line, index) => (
                  <p key={index} className={index === 0 ? "font-medium" : ""}>
                    {line}
                  </p>
                ))}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </FormItem>
  );
};

/**
 * Renders an input component based on the input type.
 * If the input type is "select" and select options are provided, it renders a SelectInput component.
 * Otherwise, it renders a DefaultInput component.
 *
 * @param {InputPrimitiveProps} props - The props for the InputPrimitive component.
 * @returns {JSX.Element} The rendered input component.
 */
const InputPrimitive = (props: InputPrimitiveProps): JSX.Element => {
  return props.inputType === "select" && props.selectOptions ? (
    <SelectInput {...props} />
  ) : (
    <DefaultInput {...props} />
  );
};

export default InputPrimitive;
