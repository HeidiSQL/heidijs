package com.mysql.jdbc;
/*
  Copyright (c) 2010, Oracle and/or its affiliates. All rights reserved.
  The MySQL Connector/J is licensed under the terms of the GPL,
  like most MySQL Connectors. There are special exceptions to the
  terms and conditions of the GPL as it is applied to this software,
  see the FLOSS License Exception available on mysql.com.

  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License as
  published by the Free Software Foundation; version 2 of the
  License.

  This program is distributed in the hope that it will be useful,  
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
  02110-1301 USA
 
 */

import java.sql.SQLException;
import java.util.Properties;



/**
 * @author tf221715
 *
 */
public class LoadBalancedAutoCommitInterceptor implements
		StatementInterceptorV2 {
	private int matchingAfterStatementCount = 0;
	private int matchingAfterStatementThreshold = 0;
	private String matchingAfterStatementRegex;
	private ConnectionImpl conn;
	private LoadBalancingConnectionProxy proxy = null;
	
	

	public void destroy() {
		// do nothing here
	}

	/* (non-Javadoc)
	 * @see com.mysql.jdbc.StatementInterceptorV2#executeTopLevelOnly()
	 */
	public boolean executeTopLevelOnly() {
		// always return false
		return false;
	}

	public void init(Connection conn, Properties props) throws SQLException {
		this.conn = (ConnectionImpl) conn;
		
		String autoCommitSwapThresholdAsString = props.getProperty("loadBalanceAutoCommitStatementThreshold",
		"0");
		try {
			this.matchingAfterStatementThreshold  = Integer.parseInt(autoCommitSwapThresholdAsString);
		} catch (NumberFormatException nfe) {
			// nothing here, being handled in LoadBalancingConnectionProxy.
		}
		String autoCommitSwapRegex = props.getProperty("loadBalanceAutoCommitStatementRegex","");
		if("".equals(autoCommitSwapRegex)){
			return;
		}
		this.matchingAfterStatementRegex = autoCommitSwapRegex;

	}

	/* (non-Javadoc)
	 * @see com.mysql.jdbc.StatementInterceptorV2#postProcess(java.lang.String, com.mysql.jdbc.Statement, com.mysql.jdbc.ResultSetInternalMethods, com.mysql.jdbc.Connection, int, boolean, boolean, java.sql.SQLException)
	 */
	public ResultSetInternalMethods postProcess(String sql,
			Statement interceptedStatement,
			ResultSetInternalMethods originalResultSet, Connection connection,
			int warningCount, boolean noIndexUsed, boolean noGoodIndexUsed,
			SQLException statementException) throws SQLException {
		
		// don't care if auto-commit is not enabled
		if(!this.conn.getAutoCommit()){
			this.matchingAfterStatementCount = 0;
		// auto-commit is enabled:
		} else {
			
			if(this.proxy == null && this.conn.isProxySet()){
				MySQLConnection lcl_proxy = this.conn.getLoadBalanceSafeProxy();
				while(lcl_proxy != null && !(lcl_proxy instanceof LoadBalancedMySQLConnection)){
					lcl_proxy = lcl_proxy.getLoadBalanceSafeProxy();
				}
				if(lcl_proxy != null){
					this.proxy = ((LoadBalancedMySQLConnection) lcl_proxy).getProxy();
				}
				
			}
			
			if(this.proxy != null){
				// increment the match count if no regex specified, or if matches:
				if(this.matchingAfterStatementRegex == null 
						|| sql.matches(matchingAfterStatementRegex)){
					this.matchingAfterStatementCount++;
				}
			}
			// trigger rebalance if count exceeds threshold:
			if(this.matchingAfterStatementCount >= this.matchingAfterStatementThreshold){
				this.matchingAfterStatementCount = 0;
				try{
					if(this.proxy != null){
						this.proxy.pickNewConnection();
					}
					
				} catch (SQLException e){
					// eat this exception, the auto-commit statement completed, but we
					// could not rebalance for some reason.  User may get exception
					// when using connection next.
				}
			}
		}
		// always return the original result set.
		return originalResultSet;
	}


	public ResultSetInternalMethods preProcess(String sql,
			Statement interceptedStatement, Connection connection)
			throws SQLException {
		// we do nothing before execution, it's unsafe to swap servers at this point.
		return null;
	}
	

	


}
