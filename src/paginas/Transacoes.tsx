import { useEffect, useState } from 'react'
import { supabase } from "@/integrations/supabase/client";
import { Database } from '../integrations/supabase/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Transacoes() {
  const [transacoes, setTransacoes] = useState<Database['public']['Tables']['transacoes']['Row'][]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [quantia, setQuantia] = useState<number | string>('');
  const [tipo, setTipo] = useState('');
  const [pessoaID, setPessoaID] = useState('');
  const [pessoas, setPessoas] = useState<{ id: string; nome: string; idade: number }[]>([]);

  useEffect(() => {
    const fetchTransacoes = async () => {
      const { data } = await supabase.from('transacoes').select('*');
      setTransacoes(data ?? []);
    };
    
    const fetchPessoas = async () => {
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData?.user) {
        console.error("Usuário não autenticado");
        return;
      }
    
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome, idade')
        .eq('usuario_id', authData.user.id);
    
      if (error) {
        console.error("Erro ao buscar pessoas:", error.message);
        return;
      }
    
      setPessoas(data ?? []);
    };

    fetchTransacoes();
    fetchPessoas();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("transacoes").delete().eq("id", id);

      if (error) throw error;

      setTransacoes((prevTransacoes) => prevTransacoes.filter((transacoes) => transacoes.id !== id));

      toast.success("Transação excluída com sucesso");
    } catch (error) {
      toast.error("Falha ao excluir transação");
    }
};

const handleAddTransacao = async () => {
  if (!descricao.trim() || !quantia || !tipo.trim() || !pessoaID) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
  }

  const quantiaNumber = typeof quantia === "string" ? Number(quantia) : quantia;

  if (isNaN(quantiaNumber)) {
      toast.error("Informe um número válido para a quantia.");
      return;
  }

  const { data: { user } } = await supabase.auth.getUser()

  try {

      if (user) {
        const { error: insertError } = await supabase
        .from("transacoes")
        .insert({
            tipo: tipo,
            quantia: quantiaNumber,
            descricao: descricao,
            pessoa_id: pessoaID,
        })
        .single();

        if (insertError) {
          console.error("Erro ao inserir transação:", insertError);
          throw insertError;
        }

        const { data: lastInsertedData, error: fetchError } = await supabase
        .from("transacoes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

        if (fetchError) {
            console.error("Erro ao buscar última transacao:", fetchError);
            throw fetchError;
        }

        if (lastInsertedData && lastInsertedData.length > 0) {
            setTransacoes((prevTransacoes) => [
                ...prevTransacoes,
                lastInsertedData[0],
            ]);
        }

        setIsModalOpen(false);
        toast.success("Transação adicionada com sucesso");
      }
  } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      toast.error("Falha ao adicionar transação.");
  }
};


return (
  <div className="relative p-4">
      <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Transações</h2>
          <Button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded btn-personalizado"
          >
              Adicionar Transação
          </Button>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-96">
                  <h2 className="text-lg font-medium text-white mb-4">Adicionar Transação</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Pessoa</label>
                    <Select value={pessoaID} onValueChange={setPessoaID}>
                      <SelectTrigger className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white">
                        <SelectValue placeholder="Selecione uma pessoa" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-white border border-gray-600 rounded">
                        <SelectGroup>
                          {pessoas.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.nome}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300">Tipo</label>
                    <Select value={tipo} onValueChange={setTipo}>
                      <SelectTrigger className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white">
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-white border border-gray-600 rounded">
                      <SelectGroup>
                        {(() => {
                          const pessoa = pessoas.find(p => p.id === pessoaID);
                          if (pessoa) {
                            return pessoa.idade < 18 ? (
                              <SelectItem value="Despesa">Despesa</SelectItem>
                            ) : (
                              <>
                                <SelectItem value="Despesa">Despesa</SelectItem>
                                <SelectItem value="Receita">Receita</SelectItem>
                              </>
                            );
                          }
                          return null;
                        })()}
                      </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300">Quantia</label>
                      <input
                          type="number"
                          value={quantia}
                          onChange={(e) => setQuantia(e.target.value)}
                          className="mt-1 block w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                      />
                  </div>
                  <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300">Descrição</label>
                      <input
                          type="text"
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
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
                          onClick={handleAddTransacao}
                      >
                          Confirmar
                      </Button>
                  </div>
              </div>
          </div>                
      )}

      {transacoes.length === 0 ? (
          <p className="text-center text-gray-400">Nenhuma transação adicionada ainda.</p>
      ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 sm:grid-cols-1 gap-4">
              {transacoes.map((transacao) => (
                  <Card key={transacao.id} className="p-4">
                      <div className="flex items-center justify-between">
                          <div className="mr-4">
                              <h3 className="font-medium">
                                  {pessoas.find((p) => p.id === transacao.pessoa_id)?.nome || "Desconhecido"}
                              </h3>
                              <p className="text-sm text-muted-foreground">Tipo: {transacao.tipo}</p>
                              <p className="text-sm text-muted-foreground">Quantia: {transacao.quantia}</p>
                              <p className="text-sm text-muted-foreground">Descrição: {transacao.descricao}</p>
                          </div>
                      
                          <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(transacao.id)}
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