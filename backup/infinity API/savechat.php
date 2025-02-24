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

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    $chat_id = $data['chat_id'] ?? '';
    $note_id = $data['note_id'] ?? '';
    $chat = $data['chat'];

    $stmt = $conn->prepare("UPDATE chat SET chat=? WHERE chat_id = ?");
    $stmt->bind_param("si", $chat, $chat_id);
    if ($stmt->execute()) {
        echo json_encode("Update successfully");
    } else {
        echo json_encode("Update failed");
    }
    $stmt->close();
}

$conn->close();

?>