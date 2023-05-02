import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { GetServerSideProps } from 'next';

type Message = {
  id: number;
  mensagem: string;
};

type Props = {
  messages: Message[];
};

export default function Home({ messages }: Props) {
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>(messages);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const subscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
        },
        (payload: { new: Message }) => {
          setRealtimeMessages((messages) => [...messages, payload.new]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleNewMessageChange = (event: any) => {
    setNewMessage(event.target.value);
  };

  const handleNewMessageSubmit = async () => {
    const { error } = await supabase.from('mensagens').insert({ mensagem: newMessage });
    if (error) {
      console.error(error);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div>
      <h1>Inserir mensagem:</h1>
      <input type="text" value={newMessage} onChange={handleNewMessageChange} />
      <button onClick={handleNewMessageSubmit}>OK</button>
      <h1>Mensagens:</h1>
      <ul>
        {realtimeMessages.map((message) => (
          <li key={message.id}>{message.mensagem}</li>
        ))}
      </ul>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { data, error } = await supabase.from('mensagens').select('*');

  if (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      messages: data,
    },
  };
};