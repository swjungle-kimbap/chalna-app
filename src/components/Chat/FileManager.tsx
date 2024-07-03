import DocumentPicker from 'react-native-document-picker';
import {uploadFile} from "../../service/Chatting/fileService";
import {directedChatMessage} from "../../interfaces/Chatting";
import {formatDateToKoreanTime} from "../../service/Chatting/DateHelpers";
import {saveChatMessages} from "../../service/Chatting/chatCache";
import {useRecoilValue} from "recoil";
import {LoginResponse} from "../../interfaces";
import {userInfoState} from "../../recoil/atoms";


const currentUserId = useRecoilValue<LoginResponse>(userInfoState).id;

const handleFileUpload = async (chatRoomId: string, file: any) => {
    try {

        const uploadResponse = await uploadFile(chatRoomId, file);
        const {fileId, presignedUrl} = uploadResponse.data;

        const fileMessage: directedChatMessage = {
            id: fileId,
            type: 'FILE',
            content: presignedUrl,
            senderId: currentUserId,
            status: true,
            createdAt: new Date().toISOString(),
            isSelf: true,
            formatedTime: formatDateToKoreanTime(new Date().toISOString()),
        };

        setMessages((prevMessages) => [...prevMessages, fileMessage]);
        saveChatMessages(chatRoomId, [fileMessage]);

    } catch (error) {
        console.error('Failed to upload file: ', error);
    }
};




const filePicker = async () => {
    try {
        const res = await DocumentPicker.pick({
            type: [DocumentPicker.types.allFiles],
        });
        await  handleFileUpload(res);
    } catch (err) {
        if (DocumentPicker.isCancel(err)) {
            console.log('User cancelled the picker');
        } else {
            throw err;
        }
    }
};







