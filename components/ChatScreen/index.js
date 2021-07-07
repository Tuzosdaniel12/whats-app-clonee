import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../../firebase";
import { useEffect, useRef, useState } from "react";
import { Avatar, IconButton } from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { getRecipient, getRecipientEmail } from "../../utils/getRecipientEmail.js";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import MicIcon from "@material-ui/icons/Mic";
import Messages from "../../components/Messages"
import styled from "styled-components";
import firebase from "firebase"
import TimeAgo from "timeago-react";


const ChatScreen = ({ chat, messages, setDisplay }) => {
	const [input, setInput] = useState();
	const [user] = useAuthState(auth);
	const router = useRouter();
	const endOfMessageRef = useRef(null);
	const [messagesSnapshot] = useCollection(
		db
			.collection("chats")
			.doc(router.query.id)
			.collection("messages")
			.orderBy("timestamp", "asc")
	);

	const showMessage = () => {
		if (messagesSnapshot) {
			return messagesSnapshot.docs.map((message) => (
				<Messages
					key={message.id}
					user={message.data().user}
					message={{
						...message.data(),
						timestamp: message.data().timestamp?.toDate().getTime()
					}}
				/>
			));
		} else {
			return JSON.parse(messages).map((message) => (
				<Messages
					key={message.id}
					user={message.user}
					message={message}
				/>
			));
		}
	};

	const sendMessage = (e) => {
		e.preventDefault();

		db.collection("users").doc(user.uid).set(
			{
				lastSeen: firebase.firestore.FieldValue.serverTimestamp()
			},
			{ merge: true }
		);

		db.collection("chats").doc(router.query.id).collection("messages").add({
			timestamp: firebase.firestore.FieldValue.serverTimestamp(),
			message: input,
			user: user.email,
			photoURL: user.photoURL
		});

		setInput("");

		ScrollToBottom();
	};

	const ScrollToBottom = () => {
		endOfMessageRef.current.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
	};

	const { recipient, recipientEmail } = getRecipient(chat.users, user);

	return (
		<Container>
			<Header>
				{recipient ? (
					<Avatar src={recipient?.photoUrl} />
				) : (
					<>
						<Avatar>{recipientEmail[0].toUpperCase()}</Avatar>
					</>
				)}
				<HeaderInfo>
					<h3>{recipient ? recipient.name : recipientEmail}</h3>
					{recipient ? (
						<p>
							Last active:{` `}
							{recipient?.lastSeen?.toDate() ? (
								<TimeAgo
									datetime={recipient?.lastSeen?.toDate()}
								/>
							) : (
								"Unavailable"
							)}
						</p>
					) : (
						<p>Loading Last active...</p>
					)}
				</HeaderInfo>
				<HeaderIcons>
					<Icon onClick={() => setDisplay()} display={false}>
						<ArrowBackIosIcon />
					</Icon>

					<Icon display={true}>
						<AttachFileIcon />
					</Icon>

					<Icon display={true}>
						<MoreVertIcon />
					</Icon>
				</HeaderIcons>
			</Header>

			<MessageContainer>
				{/**/}
				{showMessage()}
				<EndOfMessage ref={endOfMessageRef} />
			</MessageContainer>

			<InputContainer>
				<InsertEmoticonIcon />
				<Input
					value={input}
					onChange={(e) => setInput(e.target.value)}
				/>
				<button
					hidden
					disable={!input}
					type="submit"
					onClick={sendMessage}>
					Send Message
				</button>
				<MicIcon />
			</InputContainer>
		</Container>
	);
};

export default ChatScreen;

const Container = styled.div`
	display: flex;
	flex-direction: column;
    width: 100%;
`;
const Header = styled.div`
    position: sticky;
    background-color: white;
    z-index: 100;
    top: 0;
    display: flex;
    padding: 11px;
    height: 80px;
    align-items: center;
    border-bottom: 1px solid whitesmoke;
`

const HeaderInfo = styled.div`
    margin-left: 15px;
    flex: 1;

    >h3 {
        margin-bottom: 3px;
    }
    >p {
        font-size: 14px;
        color: gray;
    }
`

const HeaderIcons = styled.div`
display: flex;
`

const MessageContainer = styled.div`
	padding: 30px;
    width: 100%;
	background-color: #e5ded8;
	min-height: 90vh;
`;

const EndOfMessage = styled.div`
    margin-bottom: 50px;
`

const InputContainer = styled.form`
    display: flex;
    align-items: center;
    padding:10px;
    position: sticky;
    bottom: 0;
    background-color: white;
    z-index: 100;
`
const Input = styled.input`
	flex: 1;
	outline: 0;
	border: none;
	border-radius: 10px;
	background-color: whitesmoke;
	padding: 20px;
	margin-left: 15px;
	margin-right: 15px;
`;

const Icon = styled(IconButton)`
	display: flex;

	@media (min-width: 425px) {
		&&& {
			display: ${(props) => (props.display ? "block" : "none")};
		}
	}
`;