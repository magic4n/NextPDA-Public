import React from 'react';
import { ReleaseForm } from '../components/release/ReleaseForm';
import { SEO } from '../components/common/SEO';

export const ReleasePage: React.FC = () => {
  return (
    <div className="w-full min-h-screen">
      <SEO
        title="Публикация: Новый релиз — Форум 4PDA"
        description="Оформление и публикация новых прошивок, ядер, рекавери и модификаций по стандарту шапки тем форума 4PDA."
        canonicalPath="/release"
        keywords="опубликовать прошивку 4pda, релиз 4pda, кастомное recovery, orangefox, twrp"
      />
      <ReleaseForm />
    </div>
  );
};
