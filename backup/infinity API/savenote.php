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

    $user_id = $data['user_id'] ?? '';
    $note_id = $data['note_id'] ?? '';
    $summary = $data['summary'] ?? '';
    $summaryId = $data['summaryId'] ?? '';
    $chatId = $data['chatId'] ?? '';
    $chat = "";

    // Begin a transaction
    $conn->begin_transaction();

    try {
        // Reset the chat value in the notes table
        $stmt = $conn->prepare("UPDATE chat SET chat = ? WHERE chat_id = ?");
        $stmt->bind_param("si", $chat, $chatId);
        $stmt->execute();

        // Update the summary in the summary table
        $stmt = $conn->prepare('UPDATE summary SET summary = ? WHERE summary_id = ?');
        $stmt->bind_param("ss", $summary, $summaryId);
        $stmt->execute();

        $conn->commit();
        echo json_encode(["message" => "Save note successfully"]);
        $stmt->close();
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["message" => "Error: " . $e->getMessage()]);
    }
}

$conn->close();
?>