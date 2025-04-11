<?php 


//Esta es nuestra cadena de conexión a la base de datos

class Conexion {
    private $host = 'localhost';
    private $db = 'zomvival';
    private $usuario = 'root';
    private $password = '';
    private $charset = 'utf8mb4';
    private $conexion;

    public function conectar() {
        $this->conexion = null;
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db};charset={$this->charset}";
            $this->conexion = new PDO($dsn, $this->usuario, $this->password);
            $this->conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die('Error de conexión: ' . $e->getMessage());
        }
        return $this->conexion;
    }
}

?>