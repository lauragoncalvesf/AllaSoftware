export default function CampoSelect({
  label,
  value,
  onChange,
  options = [],
  disabled = false
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[#2D2E47] mb-2">
          {label}
        </label>
      )}

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#3E7996] disabled:bg-gray-50 disabled:text-gray-400"
      >
        {options.map((option) => (
          <option key={`${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}