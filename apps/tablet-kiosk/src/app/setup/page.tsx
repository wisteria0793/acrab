'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskSetup } from '@/hooks/useKioskSetup';
import { Settings, Save, AlertCircle } from 'lucide-react';

export default function SetupPage() {
    const router = useRouter();
    const { facilityId: existingId, saveFacilityId, isLoaded } = useKioskSetup();
    const [inputId, setInputId] = useState(existingId || '');
    const [error, setError] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputId.trim()) {
            setError('施設IDを入力してください');
            return;
        }

        // In a real scenario, you might want to verify this ID against the backend here.
        saveFacilityId(inputId.trim());
        router.push('/');
    };

    if (!isLoaded) return null;

    return (
        <div className="flex h-screen items-center justify-center bg-zinc-950 p-6 text-white overflow-hidden">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="mb-8 flex flex-col items-center">
                    <div className="mb-4 rounded-full bg-blue-500/20 p-4 text-blue-400">
                        <Settings className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">キオスク初期設定</h1>
                    <p className="mt-2 text-center text-sm text-zinc-400">
                        この端末を紐付ける「施設ID」を入力してください。
                        この画面はスタッフ専用です。
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label htmlFor="facility_id" className="mb-2 block text-sm font-medium text-zinc-300">
                            施設ID (Facility ID)
                        </label>
                        <input
                            id="facility_id"
                            type="text"
                            value={inputId}
                            onChange={(e) => {
                                setInputId(e.target.value);
                                setError('');
                            }}
                            placeholder="例: 1"
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoComplete="off"
                        />
                        {error && (
                            <p className="mt-2 flex items-center text-sm text-red-400">
                                <AlertCircle className="mr-1 h-4 w-4" />
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-500 active:bg-blue-700"
                    >
                        <Save className="mr-2 h-5 w-5" />
                        設定を保存して起動
                    </button>
                </form>

                {existingId && (
                    <div className="mt-8 rounded-lg bg-zinc-900/50 p-4 text-center text-sm">
                        <p className="text-zinc-400">現在の設定済みID: <span className="font-mono font-medium text-white">{existingId}</span></p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-2 text-blue-400 hover:text-blue-300 underline"
                        >
                            トップ画面へ戻る
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
