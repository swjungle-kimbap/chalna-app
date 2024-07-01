import {useState} from "react";
import {useRealm} from "@realm/react";

const CreateChatroomInput = () =>{
    const [chatRoom, setChatRoom] = useState('');
    const realm = useRealm();

    const handleAddChatRoom = () => {
        realm.write(()=>{
            realm.create('ChatMessage', {});
        })
    }


}
