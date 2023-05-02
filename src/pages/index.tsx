import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Message = {
  id: string;
  mensagem: string;
  room_name: string;
};

export default function Home() {
  const [roomMessages, setRoomMessages] = useState<Message[]>([]); //mensagens daquela sala
  const [newMessage, setNewMessage] = useState(""); //mensagem do input
  const [roomName, setRoomName] = useState("lobby"); //nome da sala

  useEffect(() => {
    const subscription = supabase
      .channel("table_db_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens",
        },
        (payload: { new: Message }) => {
          setRoomMessages((messages: any) => [...messages, payload.new]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleNewMessageSubmit = async () => {
    const { error } = await supabase
      .from("mensagens")
      .insert({ mensagem: newMessage, room_name: roomName });
    if (error) {
      console.error(error);
    } else {
      setNewMessage("");
    }
  };

  const handleUpdateRoom = async () => {
    const { data, error } = await supabase
      .from("mensagens")
      .select("*")
      .eq("room_name", `${roomName}`);

    if (error) {
      console.error(error);
    } else {
      const formattedData = data.map(
        (item: any) => (
          console.log(item),
          {
            id: item.id,
            room_name: item.room_name,
            mensagem: item.mensagem,
          }
        )
      );
      setRoomMessages(formattedData);
    }
  };

  return (
    <>
      <div>
        <h1>Entrar na sala</h1>
        <input
          type="text"
          value={roomName}
          onChange={(e) => {
            setRoomName(e.target.value);
          }}
          onKeyDown={(e) => {
            e.key === "Enter" ? handleUpdateRoom() : "";
          }}
        />
      </div>
      <div>
        <h1>Inserir mensagem:</h1>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
          }}
          onKeyDown={(e) => {
            e.key === "Enter" ? handleNewMessageSubmit() : "";
          }}
        />
        <h1>Mensagens:</h1>
        <ul>
          {roomMessages
            ? roomMessages.map((message) => <li key={message.id}>{message.mensagem}</li>)
            : ""}
        </ul>
      </div>
    </>
  );
}
