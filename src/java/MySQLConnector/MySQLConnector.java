import java.sql.*;
import java.util.List;
import java.util.ArrayList;

public class MySQLConnector {
    //Called when this applet is loaded into the browser.
    public static void main(String[] args) {
		//---Establish Connection---//
		Connection conn = null;
		
		try	{
			String username = "allofe";
			String password = "allofe";
			String url = "jdbc:mysql://localhost/matrix5";
			Class.forName("com.mysql.jdbc.Driver").newInstance();
			
			conn = DriverManager.getConnection(url, username, password);
			System.out.println("Database connection established.");
		}
		catch(Exception e)	{
			System.err.println("Database connection refused");
			System.err.println(e.getMessage());
		}
		
		if(conn == null)	{
			return;
		}
			
		
		//---Create Statement---//
		Statement smst = null;
		try	{
			smst = conn.createStatement();
		}
		catch(Exception e)	{
			System.err.println("Error in creating statement");
			System.err.println(e.getMessage());
		}
		
		if(smst == null)	{
			try	{
				conn.close();
			}
			catch(Exception e)	{
			}
			return;
		}
		
		
		//---Create Result Set---//
		ResultSet rs = null;
		
		try	{
			rs = smst.executeQuery("SELECT * FROM mo_gle_to_session_item_map WHERE auto_id < 10");
		}
		catch(Exception e)	{
			System.err.println("Error in result set");
			System.err.println(e.getMessage());
		}
		
		if(rs == null)	{
			try	{
				conn.close();
				smst.close();
			}
			catch(Exception e)	{
			}
			return;
		}
		
		
		//---Get Meta Data---//
		class MySQLColumnMetaData {
			int dbNumber;
			int javaNumber;
			String name;
			String dbType;
			int javaType;
			
			public void print()	{
				System.out.println("---Begin Printing Column Meta Data---");
				System.out.println("DB Number: " + this.dbNumber);
				System.out.println("Java Number: " + this.javaNumber);
				System.out.println("Name: " + this.name);
				System.out.println("DB Type: " + this.dbType);
				System.out.println("Java Type: " + this.javaType);
				System.out.println("---End Printing Column Meta Data---");
			}
		}
		
		ResultSetMetaData rsmd = null;
		int numColumns = -1;
		List<MySQLColumnMetaData> columnsMetaData = new ArrayList<MySQLColumnMetaData>();
		try	{
			rsmd = rs.getMetaData();
			numColumns = rsmd.getColumnCount();
			
			for(int i = 0; i < numColumns; i++)	{
				MySQLColumnMetaData columnMetaData = new MySQLColumnMetaData();
				columnMetaData.dbNumber = i + 1;
				columnMetaData.javaNumber = i;
				columnMetaData.name = rsmd.getColumnName(i + 1); // Our arrays are 0 based, but MySQL is 1 based.
				columnMetaData.dbType = rsmd.getColumnTypeName(i + 1);
				columnMetaData.javaType = rsmd.getColumnType(i + 1);
				
				columnMetaData.print();
				
				columnsMetaData.add(columnMetaData);
			}
		}
		catch(Exception e)	{
			System.err.println("Error getting metadata");
			System.err.println(e.getMessage());
		}
		
		
		//---Close Connections---//
		try	{
			conn.close();
			smst.close();
			rs.close();
		}
		catch(Exception e)	{
		}
		
		System.out.println("Resources freed.");
    }
}