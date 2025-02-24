<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "crud";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    $user_id = $data['user_id'] ?? '';
    $note_id = $data['note_id'] ?? '';
    $title = $data['title'] ?? '';
    $summary = $data['summary'] ?? '';
    $chat = null;

    $stmt = $conn->prepare("UPDATE notes SET title=?, summary=?, chat=? WHERE note_id=? AND user_id=?");
    $stmt->bind_param("sssss", $title, $summary, $chat, $note_id, $user_id);
    if ($stmt->execute()) {
        echo json_encode("Update successfully");
    } else {
        echo json_encode("Update failed");
    }
    $stmt->close();
}

$conn->close();
?>