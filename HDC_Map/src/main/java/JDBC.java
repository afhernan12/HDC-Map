import java.sql.*;

public class JDBC {
	public static final String JDBC_DRIVER = "com.mysql.cj.jdbc.Driver";
	public static final String APOD_URL = "jdbc:mysql://localhost:3306/property_db";
	public static final String USER = "root";
	public static final String PASS = "afhernan";
	
	private static Connection conn;
	private static Statement st;
	private static ResultSet rs;
	
	public static  ResultSet getLocation() throws ClassNotFoundException {
		
		try {
			Class.forName(JDBC_DRIVER);
			conn = DriverManager.getConnection(APOD_URL, USER, PASS);
			st = conn.createStatement();
			rs = st.executeQuery("select * from property");
			
//			while (rs.next()) {
//				System.out.println(rs.getString(1) + " " + rs.getString(2) + " " + rs.getString(3) + " " +
//						rs.getString(4) + " " + rs.getString(5));
//			}
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
		return rs;
	}
	
	public static void closeAll() {
		try {
			if (rs != null) {
				rs.close();
			}
			if (st != null) {
				st.close();
			}
			if (conn != null) {
				conn.close();
			}
		} catch (SQLException sqle) {
			System.out.println(sqle.getMessage());
		}
		
	}

}