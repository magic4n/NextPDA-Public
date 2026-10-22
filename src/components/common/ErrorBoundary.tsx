import React, { Component, ErrorInfo, ReactNode } from 'react';
import { CustomIcon } from './CustomIcon';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('NextPDA safe boundary caught issue:', error.message);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/10 border border-brand-400/20 text-brand-400 flex items-center justify-center">
              <CustomIcon name="refresh" className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Не удалось загрузить раздел</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Произошла непредвиденная ошибка при обновлении данных. Попробуйте обновить страницу или вернуться на главную страницу NextPDA.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-medium text-xs hover:from-brand-500 hover:to-brand-400 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CustomIcon name="refresh" className="w-4 h-4" />
                <span>Обновить страницу</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <CustomIcon name="home" className="w-4 h-4" />
                <span>На главную</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
