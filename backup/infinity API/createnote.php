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

  $conn->begin_transaction();

  try {
      $stmt = $conn->prepare("INSERT INTO chat (chat) VALUES (?)");
      $empty_chat = ''; 
      $stmt->bind_param("s", $empty_chat);
      $stmt->execute();
      $chat_id = $conn->insert_id; 
      $stmt->close();

      $stmt = $conn->prepare("INSERT INTO summary (summary) VALUES (?)");
      $empty_summary = ''; 
      $stmt->bind_param("s", $empty_summary);
      $stmt->execute();
      $summary_id = $conn->insert_id; 
      $stmt->close();

      $stmt = $conn->prepare("INSERT INTO flashcard (flashcard) VALUES (?)");
      $empty_flashcard = ''; 
      $stmt->bind_param("s", $empty_flashcard);
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

} else if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
  $note_id = $_GET['note_id'] ?? '';
  $user_id = $_GET['user_id'] ?? '';

  $conn->begin_transaction();

  try {
      $stmt = $conn->prepare("DELETE FROM chat WHERE chat_id = (SELECT chat_id FROM notes WHERE note_id = ?)");
      $stmt->bind_param("s", $note_id);
      $stmt->execute();
      $stmt->close();

      $stmt = $conn->prepare("DELETE FROM summary WHERE summary_id = (SELECT summary_id FROM notes WHERE note_id = ?)");
      $stmt->bind_param("s", $note_id);
      $stmt->execute();
      $stmt->close();

      $stmt = $conn->prepare("DELETE FROM flashcard WHERE flashcard_id = (SELECT flashcard_id FROM notes WHERE note_id = ?)");
      $stmt->bind_param("s", $note_id);
      $stmt->execute();
      $stmt->close();

      $stmt = $conn->prepare("DELETE FROM notes WHERE note_id = ? AND user_id = ?");
      $stmt->bind_param("ss", $note_id, $user_id);
      $stmt->execute();
      $stmt->close();

      $conn->commit();

      http_response_code(200);
      echo json_encode(["message" => "Note and associated records deleted successfully"]);

  } catch (Exception $e) {
      $conn->rollback();
      http_response_code(500);
      echo json_encode(["message" => "Error: " . $e->getMessage()]);
  }
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
