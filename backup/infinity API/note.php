<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$hostname = "sql113.infinityfree.com";
$username = "if0_37867212";
$password = "Ngick1301";
$dbname = "if0_37867212_note_akan";

$conn = new mysqli($hostname, $username, $password, $dbname);

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $note_id = $_GET['note_id'];
    $user_id = $_GET['user_id'];

    $stmt = $conn->prepare("SELECT * FROM notes WHERE note_id=? AND user_id=?");
    $stmt->bind_param("ss", $note_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $note_data = $result->fetch_assoc();

        $stmt = $conn->prepare('SELECT ct.chat FROM chat ct INNER JOIN notes nt ON ct.chat_id = nt.chat_id WHERE nt.note_id = ?');
        $stmt->bind_param('s', $note_id);
        $stmt->execute();
        $chat_result = $stmt->get_result();
        $chat_data = $chat_result->fetch_assoc();

        $stmt = $conn->prepare('SELECT st.summary FROM summary st INNER JOIN notes nt ON st.summary_id = nt.summary_id WHERE nt.note_id = ?');
        $stmt->bind_param('s', $note_id);
        $stmt->execute();
        $summary_result = $stmt->get_result();
        $summary_data = $summary_result->fetch_assoc();

        $stmt = $conn->prepare('SELECT ft.flashcard FROM flashcard ft INNER JOIN notes nt ON ft.flashcard_id = nt.flashcard_id WHERE nt.note_id = ?');
        $stmt->bind_param('s', $note_id);
        $stmt->execute();
        $flashcard_result = $stmt->get_result();
        $flashcard_data = $flashcard_result->fetch_assoc();

        $response = array(
            'note' => $note_data,
            'chat' => $chat_data,
            'summary' => $summary_data,
            'flashcard' => $flashcard_data
        );

        echo json_encode($response);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Something went wrong']);
    }
    $stmt->close();
}

$conn->close();
?>