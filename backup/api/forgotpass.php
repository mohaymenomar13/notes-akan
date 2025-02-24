<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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


function sendPasswordResetEmail($toEmail, $tempPassword) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';  
        $mail->SMTPAuth = true;
        $mail->Username = 'mohaymenomar13@gmail.com';    
        $mail->Password = 'wmqd ejab jtue ficb';     
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->setFrom('mohaymenomar13@gmail.com', 'Note-Akan');
        $mail->addAddress($toEmail);

        $mail->isHTML(true);
        $mail->Subject = 'Password Reset Request';
        $mail->Body    = "Your temporary password is <strong>$tempPassword</strong>. Please log in and change it immediately.";

        $mail->send();
        return true;
    } catch (Exception $e) {
        
        return $e;
    }
}


if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'] ?? '';

    
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        
        $tempPassword = substr(md5(rand()), 0, 8); 

        
        $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
        $updateStmt->bind_param("ss", $tempPassword, $email);
        if ($updateStmt->execute()) {
            

            $sentEmail = sendPasswordResetEmail($email, $tempPassword);

            if ($sentEmail) {
                echo json_encode(["message" => "Password reset email sent, $sentEmail"]);
            } else if ($sentEmail === false) {
                echo json_encode(["message" => "Failed to send email, $sentEmail"]);    
            } else {
                echo json_encode(["message" => "Coudn't really."]);   
            }
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Failed to update password"]);
        }
        $updateStmt->close();
    } else {
        
        http_response_code(404);
        echo json_encode(["message" => "Email not found"]);
    }

    $stmt->close();
} else {
    http_response_code(405);
    echo json_encode(["message" => "Only POST method is allowed"]);
}

$conn->close();
?>
