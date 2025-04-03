import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { useThemeStore } from "../store/themeStore";

interface Option {
  value: string;
  label: string;
}

interface SelectDropDownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SelectDropDown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select..." 
}: SelectDropDownProps) => {
  const { isDarkMode } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full text-sm px-2.5 py-3 rounded-md mt-2 flex justify-between items-center
          transition-colors
          ${isDarkMode 
            ? 'bg-gray-900 text-gray-100 border-gray-800'
            : 'bg-white text-black border-slate-100'
          }
        `}
      >
        <span className="truncate">
          {options.find(opt => opt.value === value)?.label || placeholder}
        </span>
        <LuChevronDown 
          className={`
            transition-transform 
            ${isOpen ? "rotate-180" : ""}
            ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
          `}
        />
      </button>

      {isOpen && (
        <div className={`
          absolute w-full rounded-md mt-1 shadow-md z-10 overflow-hidden
          ${isDarkMode 
            ? 'bg-gray-900 border border-gray-800'
            : 'bg-white border border-slate-100'
          }
        `}>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                px-3 py-2 text-sm cursor-pointer truncate
                transition-colors
                ${isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-100'
                  : 'hover:bg-gray-100 text-gray-800'
                }
              `}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropDown;