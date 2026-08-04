import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-3 ${className}`}>
            <header className="pb-2 border-b border-rose-100">
                <h2 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                    <span>Hapus Akun Pengguna</span>
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                    Setelah akun Anda dihapus, semua data dan sumber daya terkait akan dihapus secara permanen.
                </p>
            </header>

            <div className="pt-0.5">
                <DangerButton onClick={confirmUserDeletion} className="rounded-md px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 cursor-pointer">
                    Hapus Akun Ini
                </DangerButton>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-5 space-y-3.5">
                    <div className="border-b border-slate-100 pb-2.5">
                        <h2 className="text-sm font-bold text-slate-800">
                            Apakah Anda yakin ingin menghapus akun ini?
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Tindakan ini tidak dapat dibatalkan. Masukkan kata sandi Anda untuk mengonfirmasi bahwa Anda benar-benar ingin menghapus akun secara permanen.
                        </p>
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="password"
                            value="Kata Sandi Pengonfirmasi"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 block w-full text-xs sm:text-sm rounded-md border-slate-300 focus:ring-1 focus:ring-rose-500"
                            isFocused
                            placeholder="Masukkan kata sandi Anda"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-1"
                        />
                    </div>

                    <div className="pt-2.5 flex justify-end gap-2 border-t border-slate-100">
                        <SecondaryButton onClick={closeModal} className="rounded-md text-xs font-bold">
                            Batal
                        </SecondaryButton>

                        <DangerButton className="rounded-md text-xs font-bold bg-rose-600 hover:bg-rose-700" disabled={processing}>
                            Ya, Hapus Akun
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
