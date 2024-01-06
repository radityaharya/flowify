import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { Control, UseFormRegister } from "react-hook-form";
import { Info } from "lucide-react";
type InputProps = {
  control: Control;
  inputType: string;
  label: string;
  name: string;
  placeholder: string;
  description: string;
  register: UseFormRegister<any>;
};

const InputPrimitive = ({
  control,
  inputType,
  label,
  name,
  placeholder,
  description,
  register,
}: InputProps) => {
  const typecastInputValue = (value: string, inputType: string) => {
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
                    field.onChange(
                      typecastInputValue(e.target.value, inputType),
                    );
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

export default InputPrimitive;
