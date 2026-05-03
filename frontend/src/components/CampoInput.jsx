export default function CampoInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[#2D2E47] mb-2">
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996] disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  )
}