![Screenshot 2024-12-27 194240](https://github.com/user-attachments/assets/13c05f86-bd6c-46c9-98f1-c8cf926faaa6)
![Screenshot 2024-12-27 194353](https://github.com/user-attachments/assets/40085622-68c7-4f49-8c20-d30133783d5b)
![Screenshot 2024-12-27 194221](https://github.com/user-attachments/assets/ab0d0be4-409a-4330-9800-61afb389bc67)
![Screenshot 2024-12-27 194230](https://github.com/user-attachments/assets/8f8d1e39-c951-4b8c-ab9f-020283b086d2)
![Screenshot 2024-12-27 194409](https://github.com/user-attachments/assets/cec47b31-2346-4544-bdba-33ec55669f17)
![Screenshot 2024-12-27 194519](https://github.com/user-attachments/assets/853d8ac2-c662-4f0c-876b-539ec3aa9dcb)


🚀 While i'm doing this setup encountered some issues with IAM policies and with the help of documentation and chatGPT resolved those issues.

Spent some time troubleshooting a Kubernetes LoadBalancer setup on AWS, and here's a breakdown of the key issues I encountered and resolved:

🔍 Key Errors & Solutions:
403 Access Denied (IAM Policy Issue):

Problem: The AmazonEKSLoadBalancerControllerRole lacked permissions to interact with Elastic Load Balancer (ELB).
Solution: Added necessary IAM policies (ElasticLoadBalancingFullAccess) to the role, allowing actions like DescribeListenerAttributes.
LoadBalancer External IP in Pending State:

![Screenshot 2024-12-27 200308](https://github.com/user-attachments/assets/9532c268-c32d-4436-8188-2d9fc40a2da5)


Problem: The LoadBalancer's external IP was stuck in the pending state.
Solution: Ensured proper IAM permissions were in place, along with the correct security group configuration for inbound traffic on port 8080.
Target Group Health Check Failures:

![Screenshot 2024-12-27 200428](https://github.com/user-attachments/assets/b29d7e8a-2fda-49e5-bfdc-1c364d8385b8)


Problem: The pods behind the LoadBalancer were marked as unhealthy, blocking traffic.
Solution: Verified pod health and logs, adjusted health check configurations on AWS to ensure pods could respond successfully.
ALB Listener Misconfiguration:

Problem: The AWS Application Load Balancer listener wasn't forwarding traffic correctly.
Solution: Corrected listener configuration to route traffic to the appropriate target group on port 8080.

💡 Outcome: After these fixes, the LoadBalancer was successfully deployed, assigned an external IP, and the service became accessible to the users.
