import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/getDataServlet")
public class getDataServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
    public getDataServlet() {
        super();
    }
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) 
		throws ServletException, IOException {
		
		System.out.println("in data servlet");
		System.out.println("jdbc:mysql://localhost:3306/property_db");
		
		String data = "";
		ResultSet locations = null;
		try {
			System.out.println("entering JDBC");
			locations = JDBC.getLocation();
			System.out.println("back in servlet");
			data = myJsonConverter(locations);
		} catch (ClassNotFoundException e) {
			System.out.print(e.getMessage());
		} catch (SQLException e) {
			System.out.println(e.getMessage());
			e.printStackTrace();
		    System.out.println("SQL State: " + e.getSQLState());
		    System.out.println("Error Code: " + e.getErrorCode());
		} finally {
			JDBC.closeAll();
		}
		
		response.setContentType("application/json");
		response.getWriter().write(data);
	}
	
	private String myJsonConverter(ResultSet rs) throws SQLException {
		String data = "[\n";
		while (rs.next()) {
			data += "{\n\"name\":" + "\"" + rs.getString(2) + "\",";
			data += "\n\"address\":" + "\"" + rs.getString(3) + "\",";
			data += "\n\"units\":" + "\"" + rs.getString(4) + "\",";
			data += "\n\"bld_size\":" + "\"" + rs.getString(5) + "\",";
			data += "\n\"unit_size\":" + "\"" + rs.getString(6) + "\",";
			data += "\n\"walk_score\":" + "\"" + rs.getString(7) + "\",";
			data += "\n\"bike_score\":" + "\"" + rs.getString(8) + "\",";
			data += "\n\"transit_score\":" + "\"" + rs.getString(9) + "\",";
			data += "\n\"lat\":" + "\"" + rs.getString(10) + "\",";
			data += "\n\"lng\":" + "\"" + rs.getString(11) + "\",";
			data += "\n\"owner\":" + "\"" + rs.getString(12) + "\",";
			data += "\n\"url\":" + "\"" + rs.getString(13) + "\",";
			data += "\n\"status\":" + "\"" + rs.getString(14) + "\"\n},\n";
		}
		
		
		String minusComma = data.substring(0, data.length() - 2);
		minusComma += "\n]";
		//System.out.println(minusComma);
		return minusComma;
	}
}