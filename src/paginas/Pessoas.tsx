import { useEffect, useState } from 'react'
import { supabase } from "@/integrations/supabase/client";
import { Database } from '../integrations/supabase/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Pessoas() {
    const [pessoas, setPessoas] = useState<Database['public']['Tables']['pessoas']['Row'][]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nome, setNome] = useState('');
    const [idade, setIdade] = useState<number | string>('');

    useEffect(() => {
        const fetchUsers = async () => {
            const { data } = await supabase
                .from('pessoas')
                .select('*')

            setPessoas(data ?? []);
        }
    
        fetchUsers();
    }, []);

    const handleDelete = async (id: string) => {
        try {
          const { error } = await supabase.from("pessoas").delete().eq("id", id);
    
          if (error) throw error;
    
          setPessoas((prevPessoas) => prevPessoas.filter((pessoa) => pessoa.id !== id));
    
          toast.success("Pessoa excluída com sucesso");
        } catch (error) {
          toast.error("Falha ao excluir pessoa");
        }
    };

    const handleAddPessoa = async () => {
        if (nome.trim() === '' || idade === '') {
            toast.error("Nome e idade são obrigatórios.");
            return;
        }
        
        const idadeNumber = typeof idade === 'string' ? Number(idade) : idade;

        const { data: { user } } = await supabase.auth.getUser()
    
        if (isNaN(idadeNumber)) {
            toast.error("Idade inválida.");
            return;
        }
        try {
            if (user) {
                const { error: insertError } = await supabase
                    .from("pessoas")
                    .insert({
                        idade: idadeNumber,
                        nome: nome,
                        usuario_id: user.id
                    })
                    .single();
        
                if (insertError) {
                    console.error("Erro ao inserir pessoa:", insertError);
                    throw insertError;
                }
        
                const { data: lastInsertedData, error: fetchError } = await supabase
                    .from("pessoas")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(1);
        
                if (fetchError) {
                    console.error("Erro ao buscar última pessoa:", fetchError);
                    throw fetchError;
                }
        
                if (lastInsertedData && lastInsertedData.length > 0) {
                    setPessoas((prevPessoas) => [
                        ...prevPessoas,
                        lastInsertedData[0],
                    ]);
                }
        
                setIsModalOpen(false);
                toast.success("Pessoa adicionada com sucesso");
        
            } else {
                console.error("Usuário não autenticado");
            }
        } catch (error) {
            toast.error("Falha ao adicionar pessoa");
            console.error("Erro geral:", error);
        }        
    };
    

    return (
        <div className='relative p-4'>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Pessoas</h2>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded btn-personalizado"
                >
                    Adicionar Pessoa
                </Button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-96">
                        <h2 className="text-lg font-medium text-white mb-4">Adicionar Pessoa</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Nome</label>
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-300">Idade</label>
                            <input
                                type="number"
                                value={idade}
                                onChange={(e) => setIdade(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                            />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="outline"
                                className="mr-2 text-white border-gray-600 hover:bg-gray-700"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="text-white border-gray-600 hover:bg-gray-700"
                                onClick={handleAddPessoa}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </div>                
            )}

            {pessoas.length === 0 ? (
                <p className='relative'>Nenhuma pessoa foi adicionada ainda.</p>
            ) : (
                <div className="grid grid-cols-3 md:grid-cols-5 sm:grid-cols-1 gap-4">
                    {pessoas.map((pessoa) => (
                        <Card key={pessoa.id} className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="mr-4">
                                    <h3 className="font-medium">{pessoa.nome}</h3>
                                    <p className="text-sm text-muted-foreground">Idade: {pessoa.idade}</p>
                                </div>
                            
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => handleDelete(pessoa.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
