import { useAuthState } from "react-firebase-hooks/auth"
import styled from "styled-components"
import ChatScreen from "../../components/ChatScreen"
import HeadTab from "../../components/Head"
import Sidebar from "../../components/Sidebar"
import { auth, db } from "../../firebase"
import  {getRecipientEmail, getRecipient } from "../../utils/getRecipientEmail"

const Chats = ({chat, messages}) => {
    const [user] = useAuthState(auth);
    const recipient = getRecipient(chat.users, user);
    return (
		<Container>
			<HeadTab
				title={`Chat with ${recipient?recipient.name : getRecipientEmail(chat.users, user)}`}
			/>
			<Sidebar />
			<ChatContainer>
				<ChatScreen chat={chat} messages={messages} />
			</ChatContainer>
		</Container>
	);
}

export default Chats

export async function getServerSideProps(context) {
	const ref = db.collection("chats").doc(context.query.id);

	// Prep the Messages...
	const messagesRes = await ref
		.collection("messages")
		.orderBy("timestamp", "asc")
		.get();

	const messages = messagesRes.docs
		.map((doc) => ({
			id: doc.id,
			...doc.data()
		}))
		.map((messages) => ({
			...messages,
			timestamp: messages.timestamp.toDate().getTime()
		}));

	// Prep the Chats...
	const chatRes = await ref.get();
	const chat = {
		id: chatRes.id,
		...chatRes.data()
	};

	return {
		props: {
			messages: JSON.stringify(messages),
			chat: chat
		}
	};
}

const Container = styled.div`
    display: flex;

`

const ChatContainer = styled.div`
	flex: 1;
	height: 100vh;
	width: 100%;
	overflow: scroll;
	::-webkit-scroll {
		display: none;
	}
	-ms-overflow-style: none;
	scrollbar-width: none;
`;
