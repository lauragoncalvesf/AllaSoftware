import Modal from "./Modal"

/**
 * ModalAviso — substitui alert() e confirm() do browser.
 *
 * Modo aviso (padrão):
 *   <ModalAviso
 *     titulo="Erro"
 *     mensagem="Informe um valor válido."
 *     onClose={() => setAviso(null)}
 *   />
 *
 * Modo confirmação:
 *   <ModalAviso
 *     titulo="Excluir produto"
 *     mensagem="Tem certeza? Esta ação não pode ser desfeita."
 *     tipo="confirmacao"
 *     labelConfirmar="Excluir"
 *     corConfirmar="bg-red-600"
 *     onConfirmar={() => deletar()}
 *     onClose={() => setAviso(null)}
 *   />
 */
export default function ModalAviso({
  titulo = "Aviso",
  mensagem,
  tipo = "aviso",           // "aviso" | "confirmacao"
  labelConfirmar = "Confirmar",
  corConfirmar = "bg-[#2F8AA3]",
  onConfirmar,
  onClose
}) {
  return (
    <Modal titulo={titulo} onClose={onClose} largura="max-w-md">
      <div className="space-y-4">
        <p className="text-gray-600">{mensagem}</p>

        <div className="flex justify-end gap-3 pt-2">
          {tipo === "confirmacao" && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}

          <button
            type="button"
            onClick={tipo === "confirmacao" ? onConfirmar : onClose}
            className={`px-5 py-2.5 rounded-xl text-white hover:opacity-90 ${corConfirmar}`}
          >
            {tipo === "confirmacao" ? labelConfirmar : "OK"}
          </button>
        </div>
      </div>
    </Modal>
  )
}