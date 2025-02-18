import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Database } from '../integrations/supabase/types';

type Pessoa = Database['public']['Tables']['pessoas']['Row'];
type Transacao = Database['public']['Tables']['transacoes']['Row'];

export default function Index() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  useEffect(() => {
    const fetchPessoas = async () => {
      const { data: pessoasData, error: pessoasError } = await supabase
        .from('pessoas')
        .select('*');
        
      if (pessoasError) {
        console.error('Erro ao buscar pessoas:', pessoasError);
      } else {
        setPessoas(pessoasData || []);
      }
    };

    const fetchTransacoes = async () => {
      const { data: transacoesData, error: transacoesError } = await supabase
        .from('transacoes')
        .select('*');
        
      if (transacoesError) {
        console.error('Erro ao buscar transações:', transacoesError);
      } else {
        setTransacoes(transacoesData || []);
      }
    };

    fetchPessoas();
    fetchTransacoes();
  }, []);

  const totalReceitas = transacoes
    .filter((transacao) => transacao.tipo === 'Receita')
    .reduce((acc, transacao) => acc + transacao.quantia, 0);

  const totalDespesas = transacoes
    .filter((transacao) => transacao.tipo === 'Despesa')
    .reduce((acc, transacao) => acc + transacao.quantia, 0);

  const saldoGeral = totalReceitas - totalDespesas;

  const pessoasComTotais = pessoas.map((pessoa) => {
    const transacoesPessoa = transacoes.filter(
      (transacao) => transacao.pessoa_id === pessoa.id
    );

    const receitas = transacoesPessoa
      .filter((transacao) => transacao.tipo === 'Receita')
      .reduce((acc, transacao) => acc + transacao.quantia, 0);

    const despesas = transacoesPessoa
      .filter((transacao) => transacao.tipo === 'Despesa')
      .reduce((acc, transacao) => acc + transacao.quantia, 0);

    const saldo = receitas - despesas;

    return {
      ...pessoa,
      receitas,
      despesas,
      saldo,
    };
  });

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-semibold mb-4 text-center">Consulta de Totais</h1>

        <table className="min-w-full border border-gray-500 text-white rounded-md overflow-hidden bg-transparent">
          <thead>
            <tr className="border-b-2 border-gray-500">
              <th className="px-4 py-3 text-left border-r border-gray-500">Pessoa</th>
              <th className="px-4 py-3 text-left border-r border-gray-500">Receitas</th>
              <th className="px-4 py-3 text-left border-r border-gray-500">Despesas</th>
              <th className="px-4 py-3 text-left">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {pessoasComTotais.map((pessoa) => (
              <tr
                key={pessoa.id}
                className="border-b-2 border-gray-500"
              >
                <td className="px-4 py-2 border-r border-gray-500">{pessoa.nome}</td>
                <td className="px-4 py-2 border-r border-gray-500">
                  {pessoa.receitas.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td className="px-4 py-2 border-r border-gray-500">
                  {pessoa.despesas.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td className="px-4 py-2">
                  {pessoa.saldo.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-4 rounded-md text-center border border-gray-500">
            <h3 className="text-xl font-medium">Total de Receitas</h3>
            <p className="text-2xl text-green-600">
              {totalReceitas.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>

          <div className="p-4 rounded-md text-center border border-gray-500">
            <h3 className="text-xl font-medium">Total de Despesas</h3>
            <p className="text-2xl text-red-900">
              {totalDespesas.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>

          <div className="p-4 rounded-md text-center border border-gray-500">
            <h3 className="text-xl font-medium">Saldo Líquido</h3>
            <p className="text-2xl text-sky-600">
              {saldoGeral.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>

  );
}
