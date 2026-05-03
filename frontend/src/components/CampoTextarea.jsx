export default function CampoTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[#2D2E47] mb-2">
          {label}
        </label>
      )}

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996] resize-none"
      />
    </div>
  )
}