
import { useState } from "react";
import { HiMiniPlus, HiOutlineTrash } from "react-icons/hi2";
import { LuPaperclip } from "react-icons/lu";

interface AddAttachmentsInputProps {
  attachments: string[];
  setAttachments: (attachments: string[]) => void;
}

const AddAttachmentsInput = ({ attachments, setAttachments }: AddAttachmentsInputProps) => {
  const [newAttachment, setNewAttachment] = useState("");

  const handleAddAttachment = () => {
    if (newAttachment.trim()) {
      setAttachments([...attachments, newAttachment.trim()]);
      setNewAttachment("");
    }
  };

  const handleDeleteAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div>
      {attachments.map((item, index) => (
        <div
          key={index}
          className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2"
        >
          <div className="flex-1 flex items-center gap-3">
            <LuPaperclip className="text-gray-400" />
            <p className="text-xs text-black truncate">{item}</p>
          </div>
          <button
            type="button"
            onClick={() => handleDeleteAttachment(index)}
            className="text-red-500 hover:text-red-600"
          >
            <HiOutlineTrash className="text-lg" />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-4 mt-4">
        <div className="flex-1 flex items-center gap-3 border border-gray-100 rounded-md px-3">
          <LuPaperclip className="text-gray-400" />
          <input
            type="text"
            value={newAttachment}
            onChange={(e) => setNewAttachment(e.target.value)}
            placeholder="Add file URL"
            className="w-full text-[13px] outline-none bg-transparent py-2"
          />
        </div>
        <button
          type="button"
          onClick={handleAddAttachment}
          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 flex items-center gap-2"
        >
          <HiMiniPlus className="text-lg" /> Add
        </button>
      </div>
    </div>
  );
};

export default AddAttachmentsInput;