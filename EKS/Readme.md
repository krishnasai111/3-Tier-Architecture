

🚀 While i'm doing this setup encountered some issues with IAM policies and with the help of documentation and chatGPT resolved those issues.

Spent some time troubleshooting a Kubernetes LoadBalancer setup on AWS, and here's a breakdown of the key issues I encountered and resolved:

🔍 Key Errors & Solutions:
403 Access Denied (IAM Policy Issue):

Problem: The AmazonEKSLoadBalancerControllerRole lacked permissions to interact with Elastic Load Balancer (ELB).
Solution: Added necessary IAM policies (ElasticLoadBalancingFullAccess) to the role, allowing actions like DescribeListenerAttributes.
LoadBalancer External IP in Pending State:

Problem: The LoadBalancer's external IP was stuck in the pending state.
Solution: Ensured proper IAM permissions were in place, along with the correct security group configuration for inbound traffic on port 8080.
Target Group Health Check Failures:

Problem: The pods behind the LoadBalancer were marked as unhealthy, blocking traffic.
Solution: Verified pod health and logs, adjusted health check configurations on AWS to ensure pods could respond successfully.
ALB Listener Misconfiguration:

Problem: The AWS Application Load Balancer listener wasn't forwarding traffic correctly.
Solution: Corrected listener configuration to route traffic to the appropriate target group on port 8080.

💡 Outcome: After these fixes, the LoadBalancer was successfully deployed, assigned an external IP, and the service became accessible to the users.
