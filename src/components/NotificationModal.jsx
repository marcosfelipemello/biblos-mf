import React, { useState } from "react";
import {
  Bell,
  X,
  Quote,
  Calendar,
  HeartHandshake,
  Check,
  AlertCircle,
  Loader2,
  Share,
  Smartphone,
} from "lucide-react";

export default function NotificationModal({ isOpen, onClose, push }) {
  const [confirmingUnsubscribe, setConfirmingUnsubscribe] = useState(false);

  if (!isOpen) return null;

  const {
    supported,
    permission,
    isSubscribed,
    isIOS,
    isInstalado,
    isOldIOS,
    loading,
    error,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
  } = push;

  const isDenied = permission === "denied";

  const handleClose = () => {
    setConfirmingUnsubscribe(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 p-6 transform transition-all animate-scale-in relative">
        {/* Botão Fechar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm shrink-0">
            <Bell size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 leading-tight">
              Notificações do Biblos
            </h3>
            <p className="text-xs text-slate-400">
              Receba avisos mesmo com o app fechado
            </p>
          </div>
        </div>

        {/* O que a pessoa vai receber */}
        <div className="space-y-2.5 my-5">
          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <Quote size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">Pão Diário</h4>
                {isSubscribed && (
                  <button
                    onClick={() =>
                      updatePreferences({ manna: !preferences.manna })
                    }
                    className={`w-7 h-4 rounded-full transition-colors relative ${
                      preferences.manna ? "bg-amber-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                        preferences.manna ? "left-3.5" : "left-0.5"
                      }`}
                    />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                O versículo do dia entregue pontualmente às 9h da manhã.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Calendar size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">Plano Parado</h4>
                {isSubscribed && (
                  <button
                    onClick={() =>
                      updatePreferences({ plan: !preferences.plan })
                    }
                    className={`w-7 h-4 rounded-full transition-colors relative ${
                      preferences.plan ? "bg-amber-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                        preferences.plan ? "left-3.5" : "left-0.5"
                      }`}
                    />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Lembrete gentil se o seu plano de leitura ficar parado por 2 dias.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <HeartHandshake size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">Plano de Casal</h4>
                {isSubscribed && (
                  <button
                    onClick={() =>
                      updatePreferences({ couple: !preferences.couple })
                    }
                    className={`w-7 h-4 rounded-full transition-colors relative ${
                      preferences.couple ? "bg-amber-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                        preferences.couple ? "left-3.5" : "left-0.5"
                      }`}
                    />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Lembrete diário e aviso quando seu par concluir a leitura do dia.
              </p>
            </div>
          </div>
        </div>

        {/* Mensagens de estado e avisos */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-start gap-2 leading-relaxed">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isDenied && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800 text-xs flex items-start gap-2 leading-relaxed">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <span>
              As notificações estão bloqueadas no seu navegador. Para ativá-las,
              abra as permissões do site nas configurações do navegador.
            </span>
          </div>
        )}

        {supported === false && !isIOS && (
          <div className="mb-4 p-3 rounded-xl bg-slate-100 text-slate-600 text-xs leading-relaxed">
            Este navegador não suporta notificações Web Push.
          </div>
        )}

        {/* Botão de ação ou Instrução de instalação iOS */}
        {isSubscribed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
              <Check size={16} />
              <span>Notificações ativas neste aparelho</span>
            </div>

            {!confirmingUnsubscribe ? (
              <button
                type="button"
                onClick={() => setConfirmingUnsubscribe(true)}
                disabled={loading}
                className="w-full text-center text-[11px] text-slate-400 hover:text-red-500 py-1 transition-colors"
              >
                Parar de receber neste aparelho
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-100 space-y-2">
                <p className="text-xs text-red-700 font-medium text-center">
                  Deseja mesmo parar de receber neste aparelho?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingUnsubscribe(false)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-white text-slate-600 border border-slate-200 text-xs font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await unsubscribe();
                      setConfirmingUnsubscribe(false);
                    }}
                    disabled={loading}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Parando..." : "Confirmar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : isOldIOS ? (
          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs leading-relaxed space-y-1">
            <p className="font-bold text-slate-800">Versão do iOS não suportada</p>
            <p className="text-[11px] text-slate-600">
              No iPhone, as notificações web exigem o iOS 16.4 ou superior. Atualize seu aparelho para poder receber notificações.
            </p>
          </div>
        ) : isIOS && !isInstalado ? (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Smartphone size={16} className="text-amber-600 shrink-0" />
              <span>Instalação necessária no iPhone</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              No iPhone, as notificações só funcionam quando o Biblos é adicionado à Tela de Início:
            </p>
            <ol className="space-y-2 text-[11px] text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  1
                </span>
                <span>
                  Toque no botão <strong>Compartilhar</strong> (o quadradinho com a seta para cima <Share size={12} className="inline-block text-amber-700 -mt-0.5" /> na barra do Safari).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  2
                </span>
                <span>
                  Escolha a opção <strong>"Adicionar à Tela de Início"</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  3
                </span>
                <span>
                  Abra o Biblos pelo <strong>ícone novo</strong> na sua tela de início (não pelo Safari).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  4
                </span>
                <span>
                  Toque no <strong>sino</strong> de novo e ative as notificações.
                </span>
              </li>
            </ol>
          </div>
        ) : (
          <div>
            <button
              onClick={subscribe}
              disabled={loading || isDenied || supported === false}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Configurando...</span>
                </>
              ) : (
                <>
                  <Bell size={16} />
                  <span>Ativar Notificações</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
