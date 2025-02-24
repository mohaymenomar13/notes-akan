<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$hostname = "sql113.infinityfree.com";
$username = "if0_37867212";
$password = "Ngick1301";
$dbname = "if0_37867212_note_akan";

$conn = new mysqli($hostname, $username, $password, $dbname);


if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $note_id = $_GET['note_id'];
    $is_public = 1;

    $stmt = $conn->prepare('SELECT * FROM notes WHERE note_id=? AND is_public=?');
    $stmt->bind_param('si', $note_id, $is_public);
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
        echo json_encode(['message' => 'Note not found or not public']);
    }

    $stmt->close();
} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $user_id = $data['user_id'] ?? '';
    $title = $data['title'] ?? '';
    $summary = $data['summary'] ?? '';
    $flashcards = $data['flashcards'] ?? '';
    $is_public = 1;
    $note_id = substr(md5(uniqid(mt_rand(), true)), 0, 10);


    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("INSERT INTO chat (chat) VALUES (?)");
        $empty_chat = ''; 
        $stmt->bind_param("s", $empty_chat);
        $stmt->execute();
        $chat_id = $conn->insert_id; 
        $stmt->close();

        $stmt = $conn->prepare("INSERT INTO summary (summary) VALUES (?)");
        $stmt->bind_param("s", $summary);
        $stmt->execute();
        $summary_id = $conn->insert_id; 
        $stmt->close();

        $stmt = $conn->prepare("INSERT INTO flashcard (flashcard) VALUES (?)");
        $stmt->bind_param("s", $flashcards);
        $stmt->execute();
        $flashcard_id = $conn->insert_id; 
        $stmt->close();
        
        $stmt = $conn->prepare("INSERT INTO notes (user_id, note_id, title, is_public, chat_id, summary_id, flashcard_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssiiss", $user_id, $note_id, $title, $is_public, $chat_id, $summary_id, $flashcard_id);
        $stmt->execute();
        $stmt->close();
        
        $conn->commit();
        
        http_response_code(201);
        echo json_encode(["note_id" => $note_id]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["message" => "Error: " . $e->getMessage()]);
    }
    // $stmt = $conn->prepare('INSERT INTO notes (note_id, user_id, title, summary, flashcards, is_public) VALUES (?, ?, ?, ?, ?, ?)');
    // $stmt->bind_param('sssssi', $note_id, $user_id, $title, $summary, $flashcards, $is_public);
    // if($stmt->execute()) {
    //     echo json_encode($note_id);
    // } else {
    //     echo json_encode("Failed to copy");
    // }
    // $stmt->close();
}

$conn->close();

?>
