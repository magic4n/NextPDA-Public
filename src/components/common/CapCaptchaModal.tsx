import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomIcon } from './CustomIcon';
import { useUIStore } from '../../store/useUIStore';
import { getApiBaseUrl } from '../../services/platform';
import { fetchCapChallenge, solveCapChallenge, verifyCapSolutionOnServer } from '../../services/captcha';

export const CapCaptchaModal: React.FC = () => {
  const { isCaptchaModalOpen, captchaChallenge, captchaOnSuccess, closeCaptchaModal, showToast } = useUIStore();
  const [status, setStatus] = useState<'idle' | 'computing' | 'verified' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  if (!isCaptchaModalOpen) return null;

  const handleSolve = async () => {
    if (status === 'computing' || status === 'verified') return;
    setStatus('computing');
    setProgress(0);

    try {
      const apiBase = getApiBaseUrl();
      // 1. Получаем challenge с сервера или используем переданный
      let challengeData = captchaChallenge;
      if (!challengeData) {
        challengeData = await fetchCapChallenge(apiBase);
      }

      // 2. Вычисляем Proof-of-Work (PoW)
      const solution = await solveCapChallenge(
        challengeData.challenge,
        challengeData.difficulty || 4,
        (nonce) => setProgress(nonce)
      );

      // 3. Валидируем на сервере
      const isValid = await verifyCapSolutionOnServer(solution.token, apiBase);
      if (isValid) {
        setStatus('verified');
        showToast('Проверка безопасности пройдена!', 'success');
        setTimeout(() => {
          if (captchaOnSuccess) captchaOnSuccess();
          closeCaptchaModal();
          setStatus('idle');
        }, 600);
      } else {
        setStatus('error');
        showToast('Ошибка подтверждения капчи. Попробуйте снова.', 'error');
      }
    } catch (err: any) {
      console.warn('Captcha solve failed:', err);
      setStatus('error');
      showToast('Не удалось завершить проверку.', 'error');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (status !== 'computing') closeCaptchaModal();
          }}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm rounded-3xl bg-slate-900/95 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_35px_rgba(56,189,248,0.25)] overflow-hidden"
        >
          {/* Top banner */}
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-400 via-indigo-500 to-emerald-400" />

          {/* Close button */}
          <button
            onClick={() => closeCaptchaModal()}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <CustomIcon name="close" className="w-4 h-4" />
          </button>

          <div className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-400/20 text-brand-400 mx-auto shadow-[0_0_20px_rgba(56,189,248,0.25)]">
              <CustomIcon name="shield" className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Проверка безопасности
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Обнаружены частые одинаковые действия. Подтвердите, что вы человек.
              </p>
            </div>

            {/* CAP Interactive Widget Box */}
            <div
              onClick={handleSolve}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                status === 'verified'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : status === 'computing'
                  ? 'bg-brand-950/40 border-brand-500/40 text-brand-300'
                  : status === 'error'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:border-rose-500'
                  : 'bg-slate-950/60 border-white/10 hover:border-brand-500/50 hover:bg-slate-950/80 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox indicator */}
                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                    status === 'verified'
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : status === 'computing'
                      ? 'border-brand-400/30'
                      : 'border-white/20 bg-slate-900'
                  }`}
                >
                  {status === 'verified' ? (
                    <CustomIcon name="check" className="w-4 h-4 stroke-[3]" />
                  ) : status === 'computing' ? (
                    <div className="w-3.5 h-3.5 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
                  ) : null}
                </div>

                <div className="text-left">
                  <span className="text-xs font-semibold block">
                    {status === 'verified'
                      ? 'Проверка пройдена'
                      : status === 'computing'
                      ? 'Проверка PoW...'
                      : status === 'error'
                      ? 'Повторить попытку'
                      : 'Я человек'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {status === 'computing' && progress > 0
                      ? `Итерация: #${progress}`
                      : 'Защита от спама и частых действий'}
                  </span>
                </div>
              </div>

              {/* Logo / Badge */}
              <div className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">
                CAP
              </div>
            </div>

            <p className="text-[10px] text-slate-500 pt-1">
              Работает на базе <a href="https://github.com/tiagozip/cap" target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">CAP</a> — без раздражающих картинок и пазлов.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
