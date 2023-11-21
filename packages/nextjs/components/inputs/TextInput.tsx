import React, { ChangeEvent } from "react";
import { LightChangeEvent } from "~~/models/light-change-event";

interface Props<TParent> {
  label: string;
  placeholder: string;
  name: keyof TParent;
  optional?: boolean;
  large?: boolean;
  info?: boolean;
  className?: string;
  value?: string;
  required?: boolean;
  onChange?: (ev: LightChangeEvent<TParent>) => void;
}

const TextInput = <TParent,>({
  label,
  placeholder,
  name,
  optional,
  info,
  large = true,
  className,
  value,
  required,
  onChange,
}: Props<TParent>) => {
  return (
    <div className={`flex flex-col ${className ? className : ""}`}>
      <label className="justify-start items-center inline-flex mb-3" htmlFor="entityName">
        <div className="text-base font-bold font-['Montserrat']">{label}</div>
        {info && (
          <div className="text-center text-xs font-normal font-['Inter'] leading-none ml-1">
            info
          </div>
        )}
        {optional && (
          <span className="text-xs font-semibold uppercase rounded-lg bg-white bg-opacity-5 p-2 ml-2 mb-[-4px] mt-[-4px]">
            Optional
          </span>
        )}
      </label>
      <input
        id={name as string}
        name={name as string}
        className={`input ${large ? "input-lg" : ""} input-bordered ${
          required && !value ? "input-error" : ""
        }`}
        placeholder={placeholder}
        value={value}
        onChange={(ev: ChangeEvent<HTMLInputElement>) =>
          onChange?.({ name, value: ev.target.value })
        }
        required={required}
      />
    </div>
  );
};

export default TextInput;
