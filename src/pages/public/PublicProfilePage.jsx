import { useParams } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout.jsx';

export default function PublicProfilePage() {
  const { token } = useParams();

  return (
    <PublicLayout>
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-semibold">Profil public</h2>
        <p className="mt-2 text-sm text-slate-500">
          Token reçu : <span className="font-mono">{token}</span>
        </p>
      </div>
    </PublicLayout>
  );
}
