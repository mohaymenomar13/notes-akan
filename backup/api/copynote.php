<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$servername = 'localhost';
$username = 'root';
$password = '';
$dbname = 'crud';

$conn = new mysqli($servername, $username, $password, $dbname);

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

    echo json_encode($result->fetch_assoc());
    $stmt->close();
} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_id = $_POST['user_id'];
    $title = $_POST['title'];
    $summary = $_POST['summary'];
    $flashcards = $_POST['flashcards'];
    $is_public = 1;
    $note_id = substr(md5(uniqid(mt_rand(), true)), 0, 10);

    $stmt = $conn->prepare('INSERT INTO notes (note_id, user_id, title, summary, flashcards, is_public) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('sssssi', $note_id, $user_id, $title, $summary, $flashcards, $is_public);
    if($stmt->execute()) {
        echo json_encode($note_id);
    } else {
        echo json_encode("Failed to copy");
    }
    $stmt->close();
}

$conn->close();

?>