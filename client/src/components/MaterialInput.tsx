import { forwardRef, InputHTMLAttributes } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface MaterialInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name?: string;
  label: string;
  register?: UseFormRegisterReturn;
  error?: string;
  autoComplete?: string;
}

const MaterialInput = forwardRef<HTMLInputElement, MaterialInputProps>(
  ({ id, label, register, error, ...props }, ref) => {
    return (
      <div className="material-input relative mb-6">
        <input
          id={id}
          ref={ref}
          placeholder=" "
          {...register}
          {...props}
          className={`
            font-sans text-base px-0 pt-5 pb-2 block w-full border-0 border-b
            ${error ? 'border-error' : 'border-text-secondary'}
            bg-transparent appearance-none focus:outline-none focus:border-primary focus:border-b-2
            peer
          `}
        />
        <label
          htmlFor={id}
          className={`
            absolute text-base text-text-secondary duration-300 transform -translate-y-4
            scale-75 top-4 origin-[0] left-0 peer-focus:text-primary
            peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
            peer-focus:scale-75 peer-focus:-translate-y-4
          `}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1 text-xs text-error">{error}</p>
        )}
      </div>
    );
  }
);

MaterialInput.displayName = "MaterialInput";

export default MaterialInput;
