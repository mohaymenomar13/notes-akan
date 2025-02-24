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

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $user_id = $_GET['user_id'] ?? '';

    $stmt = $conn->prepare("SELECT * FROM notes WHERE user_id = ?");
    $stmt->bind_param("s", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $notes = array();
    while ($row = $result->fetch_assoc()) {
        $notes[] = $row;
    }

    echo json_encode($notes);
    $stmt->close();

} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_id = $_POST['user_id'];
    $title = "Untitled Notes";
    $is_public = 1;
    $note_id = substr(md5(uniqid(mt_rand(), true)), 0, 10);

    $stmt = $conn->prepare("INSERT INTO notes (note_id, user_id, title, is_public) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sssi", $note_id, $user_id, $title, $is_public);
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["note_id" => $note_id]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Error: " . $conn->error]);
    }
    $stmt->close();
} else if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $note_id = $_GET['note_id'] ?? '';
    $user_id = $_GET['user_id'] ?? '';
  
    $stmt = $conn->prepare("DELETE FROM notes WHERE note_id = ? AND user_id = ?");
    $stmt->bind_param("ss", $note_id, $user_id);
    if ($stmt->execute()) {
      http_response_code(200);
      echo json_encode(["message" => "Note deleted successfully"]);
    } else {
      http_response_code(500);
      echo json_encode(["message" => "Error: " . $conn->error]);
    }
    $stmt->close();
} else if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $note_id = $_GET['note_id'] ?? '';
    $is_public = $_GET['is_public'] ?? '';
    $user_id = $_GET['user_id'] ?? '';
  
    $stmt = $conn->prepare("UPDATE notes SET is_public = ? WHERE note_id = ? AND user_id = ?");
    $stmt->bind_param("isi", $is_public, $note_id, $user_id);
    if ($stmt->execute()) {
      http_response_code(200);
      echo json_encode(["message" => "Note updated successfully"]);
    } else {
      http_response_code(500);
      echo json_encode(["message" => "Error: " . $conn->error]);
    }
    $stmt->close();
}

$conn->close();
?>
