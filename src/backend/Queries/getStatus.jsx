



/**
 * useEffect(() => {
 *         console.log("THIS CHAT IS: "+ selectedChat);
 *         const messagesRef = ref(realtimeDB, 'messages');
 *         console.log("Filtering messages for channel:", selectedChat);
 *
 *         const q = query(messagesRef, orderByChild('Location'), equalTo(selectedChat));
 *
 *         const unsubscribe = onValue(q, (snapshot) => {
 *             const data = snapshot.val();
 *             if (data) {
 *                 // Use Promise.all without marking the callback as async
 *                 Promise.all(
 *                     Object.entries(data).map(([id, msg]) => {
 *                         return getOtherUsername(msg.Sender).then(username => ({
 *                             id,
 *                             sender: username,
 *                             text: msg.Message,
 *                             time: new Date(msg.timestamp).toLocaleTimeString(),
 *                             timeSort: msg.timestamp,
 *                             request: msg.isRequest,
 *                             invite: msg.isInvite,
 *                             refChannel: msg.refChannelID
 *                         }));
 *                     })
 *                 ).then(messagesList => {
 *                     // Sort in ascending order (oldest to newest)
 *                     messagesList.sort((a, b) => b.timeSort - a.timeSort);
 *                     console.log("Sorted messagesList:", messagesList);
 *                     setMessages(messagesList);
 *                 })
 *                     .catch(err => {
 *                         console.error("Error processing messages:", err);
 *                         setMessages([]);
 *                     });
 *             } else {
 *                 setMessages([]);
 *             }
 *         });
 */