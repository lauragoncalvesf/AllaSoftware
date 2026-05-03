export default function ResumoCard({ titulo, valor, subtitulo, corIcone }) {
  // Se tiver corIcone, usa o layout com ícone (Clientes, Produtos, Servicos, etc.)
  // Se não tiver, usa o layout simples (ClienteFinanceiro, Relatorio, etc.)
  if (corIcone) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${corIcone}`}
        >
          •
        </div>

        <div>
          <p className="text-sm text-gray-500">{titulo}</p>
          <p className="text-3xl font-bold text-[#2D2E47] mt-1">{valor}</p>
          {subtitulo && (
            <p className="text-sm text-gray-400 mt-1">{subtitulo}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold text-[#2D2E47] mt-2">{valor}</p>
      {subtitulo && (
        <p className="text-sm text-gray-400 mt-1">{subtitulo}</p>
      )}
    </div>
  )
}