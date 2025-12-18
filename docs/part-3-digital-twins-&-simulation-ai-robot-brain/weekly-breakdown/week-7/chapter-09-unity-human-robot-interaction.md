---
id: chapter-09-unity-human-robot-interaction
title: "Chapter 09: Unity & Human Robot Interaction"
sidebar_position: 2
description: "Using Unity for human-robot interaction simulation and VR/AR interfaces"
---

# Chapter 09: Unity & Human Robot Interaction

## Learning Objectives
After completing this chapter, students will be able to:
1. Design and implement Unity-based simulation environments for humanoid robotics
2. Create intuitive human-robot interaction interfaces using Unity's UI system
3. Integrate Unity simulations with ROS 2 for bidirectional communication
4. Develop VR/AR interfaces for enhanced human-robot interaction
5. Implement multimodal interaction systems combining visual, auditory, and haptic feedback

## Conceptual Explanation
Unity has emerged as a powerful platform for developing immersive human-robot interaction (HRI) experiences, particularly in the context of humanoid robotics. Unlike traditional simulation environments focused primarily on physics accuracy, Unity excels at creating visually rich, interactive environments that can facilitate natural human-robot communication and collaboration.

Unity's real-time rendering capabilities, extensive asset ecosystem, and cross-platform support make it ideal for:
- **Virtual Reality (VR) interfaces**: Immersive control and monitoring of humanoid robots
- **Augmented Reality (AR) overlays**: Enhanced situational awareness and robot state visualization
- **Interactive training environments**: Safe spaces for humans to learn robot capabilities
- **Remote operation interfaces**: Intuitive teleoperation with 3D visualization
- **Social interaction prototyping**: Testing human-robot social behaviors

The integration of Unity with ROS 2 enables bidirectional communication where Unity serves as both a simulation environment and an interaction interface. Robot sensor data can be visualized in Unity, while human commands from Unity interfaces can control real or simulated robots.

For humanoid robots specifically, Unity provides unique advantages:
- **Character Animation**: Advanced animation systems for realistic humanoid movement
- **Social Cues**: Visual and behavioral elements that enhance social interaction
- **Environmental Simulation**: Rich 3D environments for testing navigation and interaction
- **User Experience**: Intuitive interfaces for non-expert users to interact with robots

## Technical Content
### Unity ROS 2 Integration Setup
```csharp
// ROS2Connector.cs - Main ROS 2 connection manager for Unity
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Ros2ForUnity.Messages.Std_msgs;
using Ros2ForUnity.Messages.Sensor_msgs;
using Ros2ForUnity.Messages.Geometry_msgs;

public class ROS2Connector : MonoBehaviour
{
    [Header("ROS 2 Connection Settings")]
    public string rosAgentIp = "127.0.0.1";
    public int rosAgentPort = 8888;
    public string robotNamespace = "/humanoid_robot";

    [Header("Publishers")]
    public string jointCommandTopic = "/joint_commands";
    public string speechCommandTopic = "/speech_command";

    [Header("Subscribers")]
    public string jointStateTopic = "/joint_states";
    public string robotStateTopic = "/robot_state";
    public string cameraTopic = "/camera/image_raw";

    private Ros2ForUnity.Ros2ForUnity ros2Agent;
    private Dictionary<string, JointState> jointStates;
    private RobotState robotState;

    // Publishers
    private Ros2ForUnity.Publisher jointCommandPublisher;
    private Ros2ForUnity.Publisher speechCommandPublisher;

    // Subscribers
    private Ros2ForUnity.Subscriber jointStateSubscriber;
    private Ros2ForUnity.Subscriber robotStateSubscriber;

    void Start()
    {
        InitializeROS2Connection();
        SetupPublishersAndSubscribers();
    }

    void InitializeROS2Connection()
    {
        // Initialize ROS 2 connection
        ros2Agent = new Ros2ForUnity.Ros2ForUnity();
        ros2Agent.Init(rosAgentIp, rosAgentPort);

        jointStates = new Dictionary<string, JointState>();
        robotState = new RobotState();
    }

    void SetupPublishersAndSubscribers()
    {
        // Create publishers
        jointCommandPublisher = ros2Agent.CreatePublisher<JointTrajectory>(
            robotNamespace + jointCommandTopic,
            Ros2ForUnity.QoSProfile.Default
        );

        speechCommandPublisher = ros2Agent.CreatePublisher<String>(
            robotNamespace + speechCommandTopic,
            Ros2ForUnity.QoSProfile.Default
        );

        // Create subscribers
        jointStateSubscriber = ros2Agent.CreateSubscriber<JointState>(
            robotNamespace + jointStateTopic,
            JointStateCallback,
            Ros2ForUnity.QoSProfile.Default
        );

        robotStateSubscriber = ros2Agent.CreateSubscriber<String>(
            robotNamespace + robotStateTopic,
            RobotStateCallback,
            Ros2ForUnity.QoSProfile.Default
        );
    }

    void JointStateCallback(JointState msg)
    {
        // Update joint states dictionary
        for (int i = 0; i < msg.name.Count; i++)
        {
            if (i < msg.position.Count)
            {
                if (!jointStates.ContainsKey(msg.name[i]))
                {
                    jointStates.Add(msg.name[i], msg);
                }
                else
                {
                    jointStates[msg.name[i]] = msg;
                }
            }
        }

        // Update Unity robot model based on joint states
        UpdateRobotModel();
    }

    void RobotStateCallback(String msg)
    {
        robotState.state = msg.data;
        UpdateRobotVisualization();
    }

    void UpdateRobotModel()
    {
        // Update Unity robot model based on received joint states
        foreach (var joint in jointStates)
        {
            Transform jointTransform = FindJointTransform(joint.Key);
            if (jointTransform != null)
            {
                // Apply joint position to Unity transform
                // This would depend on your specific robot model setup
            }
        }
    }

    void UpdateRobotVisualization()
    {
        // Update visual representation based on robot state
        // e.g., change materials based on state, update UI elements
    }

    Transform FindJointTransform(string jointName)
    {
        // Find the corresponding Unity transform for a joint name
        // Implementation depends on your robot model hierarchy
        return transform.Find(jointName);
    }

    public void SendJointCommand(JointTrajectory trajectory)
    {
        if (jointCommandPublisher != null)
        {
            jointCommandPublisher.Publish(trajectory);
        }
    }

    public void SendSpeechCommand(string command)
    {
        if (speechCommandPublisher != null)
        {
            String msg = new String();
            msg.data = command;
            speechCommandPublisher.Publish(msg);
        }
    }

    void OnDestroy()
    {
        // Clean up ROS 2 connections
        if (ros2Agent != null)
        {
            ros2Agent.Shutdown();
        }
    }
}
```

### Humanoid Robot Model Controller for Unity
```csharp
// HumanoidRobotController.cs - Controls humanoid robot model in Unity
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Animations;

public class HumanoidRobotController : MonoBehaviour
{
    [Header("Joint Configuration")]
    public Transform headJoint;
    public Transform[] leftArmJoints;  // shoulder, elbow, wrist
    public Transform[] rightArmJoints; // shoulder, elbow, wrist
    public Transform[] leftLegJoints;  // hip, knee, ankle
    public Transform[] rightLegJoints; // hip, knee, ankle

    [Header("Animation Parameters")]
    public float moveSpeed = 2.0f;
    public float turnSpeed = 90.0f; // degrees per second
    public float jointSpeed = 60.0f; // degrees per second

    [Header("Sensors")]
    public Transform[] cameras;
    public Transform[] IMUSensors;

    private Animator animator;
    private CharacterController characterController;
    private Dictionary<string, float> jointPositions;

    void Start()
    {
        animator = GetComponent<Animator>();
        characterController = GetComponent<CharacterController>();
        jointPositions = new Dictionary<string, float>();

        InitializeJointPositions();
    }

    void InitializeJointPositions()
    {
        // Initialize joint positions dictionary with current values
        if (headJoint != null) jointPositions["head"] = headJoint.localEulerAngles.y;
        // Initialize other joints similarly
    }

    void Update()
    {
        // Update joint positions based on ROS 2 commands
        UpdateFromROSCommands();

        // Handle user input for direct control (for testing)
        HandleDirectControl();
    }

    void UpdateFromROSCommands()
    {
        // This would be called when ROS 2 joint commands are received
        // Update joint positions based on received commands
        foreach (var joint in jointPositions)
        {
            Transform jointTransform = GetJointTransform(joint.Key);
            if (jointTransform != null)
            {
                // Smoothly interpolate to target position
                float currentAngle = jointTransform.localEulerAngles.y;
                float targetAngle = joint.Value;
                float newAngle = Mathf.MoveTowards(currentAngle, targetAngle, jointSpeed * Time.deltaTime);

                jointTransform.localEulerAngles = new Vector3(
                    jointTransform.localEulerAngles.x,
                    newAngle,
                    jointTransform.localEulerAngles.z
                );
            }
        }
    }

    void HandleDirectControl()
    {
        // For testing: direct keyboard control
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");

        Vector3 movement = new Vector3(horizontal, 0, vertical);
        movement = transform.TransformDirection(movement);
        movement *= moveSpeed * Time.deltaTime;

        characterController.Move(movement);

        // Turning
        if (horizontal != 0)
        {
            transform.Rotate(0, horizontal * turnSpeed * Time.deltaTime, 0);
        }
    }

    public void SetJointPosition(string jointName, float position)
    {
        if (jointPositions.ContainsKey(jointName))
        {
            jointPositions[jointName] = position;
        }
        else
        {
            jointPositions.Add(jointName, position);
        }
    }

    public void SetJointPositions(Dictionary<string, float> positions)
    {
        foreach (var pos in positions)
        {
            SetJointPosition(pos.Key, pos.Value);
        }
    }

    Transform GetJointTransform(string jointName)
    {
        switch (jointName)
        {
            case "head":
                return headJoint;
            // Add cases for other joints
            default:
                return transform.Find(jointName);
        }
    }

    // Animation event methods
    public void StartWalking()
    {
        if (animator != null)
        {
            animator.SetBool("IsWalking", true);
        }
    }

    public void StopWalking()
    {
        if (animator != null)
        {
            animator.SetBool("IsWalking", false);
        }
    }

    public void SetEmotion(string emotion)
    {
        if (animator != null)
        {
            animator.SetTrigger(emotion);
        }
    }
}
```

### Unity UI for Human-Robot Interaction
```csharp
// HRIInterfaceManager.cs - Manages the human-robot interaction interface
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class HRIInterfaceManager : MonoBehaviour
{
    [Header("UI Panels")]
    public GameObject mainControlPanel;
    public GameObject robotStatusPanel;
    public GameObject commandPanel;
    public GameObject vrControlPanel;

    [Header("Status Elements")]
    public TextMeshProUGUI robotStateText;
    public TextMeshProUGUI batteryLevelText;
    public TextMeshProUGUI connectionStatusText;
    public Slider batterySlider;

    [Header("Command Elements")]
    public Button moveForwardButton;
    public Button moveBackwardButton;
    public Button turnLeftButton;
    public Button turnRightButton;
    public Button speakButton;
    public InputField speechInputField;
    public Dropdown commandDropdown;

    [Header("VR Interaction Elements")]
    public GameObject vrHandLeft;
    public GameObject vrHandRight;
    public GameObject vrPointer;

    private ROS2Connector ros2Connector;
    private HumanoidRobotController robotController;

    void Start()
    {
        InitializeUI();
        SetupEventHandlers();
    }

    void InitializeUI()
    {
        // Initialize UI elements
        robotStateText.text = "Initializing...";
        batteryLevelText.text = "100%";
        connectionStatusText.text = "Disconnected";

        if (batterySlider != null)
        {
            batterySlider.value = 1.0f;
        }

        // Setup command dropdown options
        if (commandDropdown != null)
        {
            commandDropdown.ClearOptions();
            List<string> options = new List<string>
            {
                "Stand Up",
                "Sit Down",
                "Wave",
                "Point",
                "Follow Me",
                "Stop",
                "Reset Position"
            };
            commandDropdown.AddOptions(options);
        }
    }

    void SetupEventHandlers()
    {
        // Setup button click events
        if (moveForwardButton != null)
            moveForwardButton.onClick.AddListener(() => SendCommand("move_forward"));

        if (moveBackwardButton != null)
            moveBackwardButton.onClick.AddListener(() => SendCommand("move_backward"));

        if (turnLeftButton != null)
            turnLeftButton.onClick.AddListener(() => SendCommand("turn_left"));

        if (turnRightButton != null)
            turnRightButton.onClick.AddListener(() => SendCommand("turn_right"));

        if (speakButton != null)
            speakButton.onClick.AddListener(SendSpeechCommand);

        if (commandDropdown != null)
            commandDropdown.onValueChanged.AddListener(SendPredefinedCommand);
    }

    public void UpdateRobotStatus(string state, float batteryLevel)
    {
        if (robotStateText != null)
            robotStateText.text = state;

        if (batteryLevelText != null)
            batteryLevelText.text = $"{batteryLevel:F1}%";

        if (batterySlider != null)
            batterySlider.value = batteryLevel / 100.0f;

        // Update connection status based on robot state
        if (connectionStatusText != null)
        {
            connectionStatusText.text = state != "Disconnected" ? "Connected" : "Disconnected";
            connectionStatusText.color = state != "Disconnected" ? Color.green : Color.red;
        }
    }

    void SendCommand(string command)
    {
        if (ros2Connector != null)
        {
            ros2Connector.SendSpeechCommand(command);
        }
    }

    void SendPredefinedCommand(int index)
    {
        string command = commandDropdown.options[index].text.ToLower().Replace(" ", "_");
        SendCommand(command);
    }

    void SendSpeechCommand()
    {
        if (speechInputField != null && !string.IsNullOrEmpty(speechInputField.text))
        {
            if (ros2Connector != null)
            {
                ros2Connector.SendSpeechCommand(speechInputField.text);
                speechInputField.text = ""; // Clear input field
            }
        }
    }

    // VR interaction methods
    public void HandleVRInput()
    {
        // Handle VR controller input for robot control
        if (vrPointer != null)
        {
            // Raycast from VR controller to interact with objects
            RaycastHit hit;
            if (Physics.Raycast(vrPointer.transform.position, vrPointer.transform.forward, out hit))
            {
                if (hit.collider.CompareTag("Interactive"))
                {
                    // Highlight interactive object
                    HighlightObject(hit.collider.gameObject);
                }
            }
        }
    }

    void HighlightObject(GameObject obj)
    {
        // Add visual feedback for interactive objects
        Renderer renderer = obj.GetComponent<Renderer>();
        if (renderer != null)
        {
            Color originalColor = renderer.material.color;
            renderer.material.color = Color.yellow;

            // Reset color after delay
            StartCoroutine(ResetColor(renderer, originalColor, 0.5f));
        }
    }

    IEnumerator ResetColor(Renderer renderer, Color originalColor, float delay)
    {
        yield return new WaitForSeconds(delay);
        renderer.material.color = originalColor;
    }

    // Animation control methods
    public void SetRobotEmotion(string emotion)
    {
        if (robotController != null)
        {
            robotController.SetEmotion(emotion);
        }
    }

    public void StartRobotAnimation(string animationName)
    {
        if (robotController != null)
        {
            // Trigger specific animation
            switch (animationName)
            {
                case "wave":
                    robotController.SetEmotion("Wave");
                    break;
                case "greeting":
                    robotController.SetEmotion("Greeting");
                    break;
                case "idle":
                    robotController.SetEmotion("Idle");
                    break;
            }
        }
    }

    // Update method for continuous interaction
    void Update()
    {
        if (vrControlPanel.activeSelf)
        {
            HandleVRInput();
        }
    }
}
```

### Unity VR Integration for Humanoid Control
```csharp
// VRHumanoidController.cs - VR-based humanoid robot control
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR;

public class VRHumanoidController : MonoBehaviour
{
    [Header("VR Controllers")]
    public GameObject leftController;
    public GameObject rightController;
    public GameObject headController;

    [Header("Robot Control Mapping")]
    public Transform robotLeftHandTarget;
    public Transform robotRightHandTarget;
    public Transform robotHeadTarget;

    [Header("Interaction Settings")]
    public float interactionDistance = 2.0f;
    public LayerMask interactionLayer;

    private XRNode leftHandNode = XRNode.LeftHand;
    private XRNode rightHandNode = XRNode.RightHand;
    private XRNode headNode = XRNode.Head;

    private InputDevice leftHandDevice;
    private InputDevice rightHandDevice;

    void Start()
    {
        // Initialize VR devices
        InitializeVRDevices();
    }

    void InitializeVRDevices()
    {
        leftHandDevice = InputDevices.GetDeviceAtXRNode(leftHandNode);
        rightHandDevice = InputDevices.GetDeviceAtXRNode(rightHandNode);
    }

    void Update()
    {
        UpdateVRControllers();
        UpdateRobotTargets();
        HandleVRInteractions();
    }

    void UpdateVRControllers()
    {
        // Update controller positions and rotations
        if (leftController != null)
        {
            leftHandDevice.TryGetFeatureValue(CommonUsages.devicePosition, out Vector3 leftPos);
            leftHandDevice.TryGetFeatureValue(CommonUsages.deviceRotation, out Quaternion leftRot);

            leftController.transform.position = leftPos;
            leftController.transform.rotation = leftRot;
        }

        if (rightController != null)
        {
            rightHandDevice.TryGetFeatureValue(CommonUsages.devicePosition, out Vector3 rightPos);
            rightHandDevice.TryGetFeatureValue(CommonUsages.deviceRotation, out Quaternion rightRot);

            rightController.transform.position = rightPos;
            rightController.transform.rotation = rightRot;
        }

        if (headController != null)
        {
            InputDevice headDevice = InputDevices.GetDeviceAtXRNode(headNode);
            headDevice.TryGetFeatureValue(CommonUsages.devicePosition, out Vector3 headPos);
            headDevice.TryGetFeatureValue(CommonUsages.deviceRotation, out Quaternion headRot);

            headController.transform.position = headPos;
            headController.transform.rotation = headRot;
        }
    }

    void UpdateRobotTargets()
    {
        // Update robot target positions based on VR controller positions
        if (robotLeftHandTarget != null && leftController != null)
        {
            robotLeftHandTarget.position = leftController.transform.position;
            robotLeftHandTarget.rotation = leftController.transform.rotation;
        }

        if (robotRightHandTarget != null && rightController != null)
        {
            robotRightHandTarget.position = rightController.transform.position;
            robotRightHandTarget.rotation = rightController.transform.rotation;
        }

        if (robotHeadTarget != null && headController != null)
        {
            robotHeadTarget.position = headController.transform.position;
            robotHeadTarget.rotation = headController.transform.rotation;
        }
    }

    void HandleVRInteractions()
    {
        // Handle button presses for robot control
        if (leftHandDevice.isValid)
        {
            leftHandDevice.TryGetFeatureValue(CommonUsages.triggerButton, out bool leftTriggerPressed);

            if (leftTriggerPressed)
            {
                // Send command to robot based on left controller position
                SendRobotCommand("left_hand_follow", leftController.transform.position);
            }
        }

        if (rightHandDevice.isValid)
        {
            rightHandDevice.TryGetFeatureValue(CommonUsages.triggerButton, out bool rightTriggerPressed);

            if (rightTriggerPressed)
            {
                // Send command to robot based on right controller position
                SendRobotCommand("right_hand_follow", rightController.transform.position);
            }
        }
    }

    void SendRobotCommand(string commandType, Vector3 targetPosition)
    {
        // Send command to robot via ROS 2
        // This would typically involve creating a ROS 2 message and publishing it
        Debug.Log($"Sending command: {commandType} to position {targetPosition}");
    }

    // Raycasting for object interaction
    public void RaycastInteraction()
    {
        RaycastHit hit;
        Vector3 controllerForward = rightController.transform.forward;
        Vector3 controllerPosition = rightController.transform.position;

        if (Physics.Raycast(controllerPosition, controllerForward, out hit, interactionDistance, interactionLayer))
        {
            // Handle interaction with hit object
            InteractableObject interactable = hit.collider.GetComponent<InteractableObject>();
            if (interactable != null)
            {
                interactable.Interact();
            }
        }
    }
}

// Interactable object base class
public abstract class InteractableObject : MonoBehaviour
{
    public virtual void Interact()
    {
        Debug.Log($"Interacting with {gameObject.name}");
    }

    void OnMouseEnter()
    {
        Highlight(true);
    }

    void OnMouseExit()
    {
        Highlight(false);
    }

    protected virtual void Highlight(bool isHighlighted)
    {
        // Add highlighting effect
        Renderer renderer = GetComponent<Renderer>();
        if (renderer != null)
        {
            renderer.material.SetFloat("_EmissionPower", isHighlighted ? 2.0f : 0.0f);
        }
    }
}
```

### Unity Scene Management for HRI
```csharp
// HRISceneManager.cs - Manages different HRI scenes and states
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class HRISceneManager : MonoBehaviour
{
    [Header("Scene Configuration")]
    public string mainSceneName = "MainHRI";
    public string vrSceneName = "VRHRI";
    public string arSceneName = "ARHRI";

    [Header("Interaction Modes")]
    public InteractionMode currentMode = InteractionMode.Desktop;
    public enum InteractionMode { Desktop, VR, AR, Mobile }

    [Header("Robot Prefabs")]
    public GameObject robotPrefab;
    public GameObject[] environmentPrefabs;

    private Dictionary<InteractionMode, string> sceneMap;

    void Start()
    {
        InitializeSceneMap();
        InitializeInteractionMode();
    }

    void InitializeSceneMap()
    {
        sceneMap = new Dictionary<InteractionMode, string>
        {
            { InteractionMode.Desktop, mainSceneName },
            { InteractionMode.VR, vrSceneName },
            { InteractionMode.AR, arSceneName },
            { InteractionMode.Mobile, mainSceneName } // Mobile uses main scene with mobile UI
        };
    }

    void InitializeInteractionMode()
    {
        // Detect platform and set appropriate mode
        if (Application.isMobilePlatform)
        {
            currentMode = InteractionMode.Mobile;
        }
        else if (IsVRSupported())
        {
            currentMode = InteractionMode.VR;
        }
        else
        {
            currentMode = InteractionMode.Desktop;
        }

        LoadSceneForMode(currentMode);
    }

    bool IsVRSupported()
    {
        // Check if VR is supported on this platform
        return UnityEngine.XR.XRSettings.isDeviceActive;
    }

    public void SwitchInteractionMode(InteractionMode newMode)
    {
        if (currentMode != newMode)
        {
            currentMode = newMode;
            LoadSceneForMode(newMode);
        }
    }

    void LoadSceneForMode(InteractionMode mode)
    {
        if (sceneMap.ContainsKey(mode))
        {
            SceneManager.LoadScene(sceneMap[mode]);
        }
        else
        {
            Debug.LogWarning($"No scene configured for interaction mode: {mode}");
        }
    }

    public void LoadEnvironment(string environmentName)
    {
        // Load specific environment for the robot
        GameObject environment = FindEnvironmentPrefab(environmentName);
        if (environment != null)
        {
            Instantiate(environment, Vector3.zero, Quaternion.identity);
        }
    }

    GameObject FindEnvironmentPrefab(string name)
    {
        foreach (GameObject prefab in environmentPrefabs)
        {
            if (prefab.name == name)
                return prefab;
        }
        return null;
    }

    public void SpawnRobotAt(Vector3 position, Quaternion rotation)
    {
        if (robotPrefab != null)
        {
            Instantiate(robotPrefab, position, rotation);
        }
    }

    public void ResetRobot()
    {
        // Reset robot to default state
        GameObject robot = GameObject.FindGameObjectWithTag("Robot");
        if (robot != null)
        {
            // Reset robot position, rotation, and state
            robot.transform.position = Vector3.zero + Vector3.up * 0.5f;
            robot.transform.rotation = Quaternion.identity;

            // Reset robot controller
            HumanoidRobotController controller = robot.GetComponent<HumanoidRobotController>();
            if (controller != null)
            {
                controller.SetEmotion("Idle");
            }
        }
    }

    // Scene-specific initialization
    public void InitializeMainScene()
    {
        // Setup for desktop interaction
        LoadEnvironment("OfficeEnvironment");
        SpawnRobotAt(new Vector3(0, 0, 5), Quaternion.identity);
    }

    public void InitializeVRScene()
    {
        // Setup for VR interaction
        LoadEnvironment("VRTrainingEnvironment");
        SpawnRobotAt(new Vector3(0, 0, 0), Quaternion.identity);
    }

    public void InitializeARScene()
    {
        // Setup for AR interaction
        // AR typically uses camera feed as background
        SpawnRobotAt(Vector3.zero, Quaternion.identity);
    }
}
```

## Practical Examples
### Example 1: Complete Unity HRI Scene Setup
```csharp
// CompleteHRIExample.cs - Full example of HRI system in Unity
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class CompleteHRIExample : MonoBehaviour
{
    [Header("HRI System Components")]
    public ROS2Connector ros2Connector;
    public HumanoidRobotController robotController;
    public HRIInterfaceManager interfaceManager;
    public HRISceneManager sceneManager;

    [Header("Social Interaction Elements")]
    public GameObject speechBubble;
    public TextMeshPro speechText;
    public Animator robotFaceAnimator;

    [Header("Gesture Recognition")]
    public GameObject gestureRecognizer;
    public GameObject[] gesturePrefabs;

    private Queue<string> speechQueue;
    private bool isSpeaking = false;

    void Start()
    {
        InitializeHRIComponents();
        SetupEventListeners();
        StartHRIInteraction();
    }

    void InitializeHRIComponents()
    {
        speechQueue = new Queue<string>();

        // Ensure all components are initialized
        if (ros2Connector == null)
            ros2Connector = FindObjectOfType<ROS2Connector>();

        if (robotController == null)
            robotController = FindObjectOfType<HumanoidRobotController>();

        if (interfaceManager == null)
            interfaceManager = FindObjectOfType<HRIInterfaceManager>();

        if (sceneManager == null)
            sceneManager = FindObjectOfType<HRISceneManager>();
    }

    void SetupEventListeners()
    {
        // Setup ROS 2 message listeners
        if (ros2Connector != null)
        {
            // Subscribe to robot speech responses
            // This would be implemented based on your ROS 2 message types
        }
    }

    void StartHRIInteraction()
    {
        // Initialize the HRI session
        Debug.Log("Starting Human-Robot Interaction Session");

        // Set initial robot state
        if (robotController != null)
        {
            robotController.SetEmotion("Greeting");
        }

        // Show welcome message
        ShowSpeechMessage("Hello! I am your humanoid assistant. How can I help you today?");

        // Update interface
        if (interfaceManager != null)
        {
            interfaceManager.UpdateRobotStatus("Active", 100.0f);
        }
    }

    public void SendCommandToRobot(string command)
    {
        if (ros2Connector != null)
        {
            ros2Connector.SendSpeechCommand(command);

            // Show user feedback
            ShowSpeechMessage($"Sending command: {command}");
        }
    }

    public void ShowSpeechMessage(string message)
    {
        if (speechBubble != null)
        {
            speechBubble.SetActive(true);
        }

        if (speechText != null)
        {
            speechText.text = message;
        }

        // Auto-hide after delay
        StartCoroutine(HideSpeechBubbleAfterDelay(5.0f));
    }

    IEnumerator HideSpeechBubbleAfterDelay(float delay)
    {
        yield return new WaitForSeconds(delay);
        if (speechBubble != null)
        {
            speechBubble.SetActive(false);
        }
    }

    // Gesture handling
    public void RecognizeGesture(string gestureName)
    {
        switch (gestureName.ToLower())
        {
            case "wave":
                HandleWaveGesture();
                break;
            case "point":
                HandlePointGesture();
                break;
            case "stop":
                HandleStopGesture();
                break;
            default:
                Debug.Log($"Unknown gesture: {gestureName}");
                break;
        }
    }

    void HandleWaveGesture()
    {
        if (robotController != null)
        {
            robotController.SetEmotion("Wave");
        }
        ShowSpeechMessage("I see you waving! Hello!");
    }

    void HandlePointGesture()
    {
        if (robotController != null)
        {
            robotController.SetEmotion("Pointing");
        }
        ShowSpeechMessage("I see you pointing. What would you like me to look at?");
    }

    void HandleStopGesture()
    {
        if (robotController != null)
        {
            robotController.SetEmotion("Stop");
        }
        ShowSpeechMessage("I understand. I will stop.");
    }

    // Social behavior management
    public void SetRobotSocialBehavior(SocialBehaviorType behavior)
    {
        if (robotController != null)
        {
            switch (behavior)
            {
                case SocialBehaviorType.Friendly:
                    robotController.SetEmotion("Friendly");
                    break;
                case SocialBehaviorType.Formal:
                    robotController.SetEmotion("Formal");
                    break;
                case SocialBehaviorType.Casual:
                    robotController.SetEmotion("Casual");
                    break;
            }
        }
    }

    public enum SocialBehaviorType { Friendly, Formal, Casual }

    // Update method for continuous interaction
    void Update()
    {
        // Handle continuous interaction elements
        HandleUserInput();

        // Update speech queue if needed
        ProcessSpeechQueue();
    }

    void HandleUserInput()
    {
        // Handle keyboard shortcuts for demo purposes
        if (Input.GetKeyDown(KeyCode.Space))
        {
            // Toggle robot idle animation
            if (robotController != null)
            {
                robotController.SetEmotion("Idle");
            }
        }

        if (Input.GetKeyDown(KeyCode.S))
        {
            // Send stop command
            SendCommandToRobot("stop");
        }

        if (Input.GetKeyDown(KeyCode.G))
        {
            // Send greeting command
            SendCommandToRobot("greet");
        }
    }

    void ProcessSpeechQueue()
    {
        // Process any queued speech messages
        if (speechQueue.Count > 0 && !isSpeaking)
        {
            string message = speechQueue.Dequeue();
            ShowSpeechMessage(message);
            isSpeaking = true;

            // Set speaking flag to false after delay
            StartCoroutine(ResetSpeakingFlag(5.0f));
        }
    }

    IEnumerator ResetSpeakingFlag(float delay)
    {
        yield return new WaitForSeconds(delay);
        isSpeaking = false;
    }

    void OnDestroy()
    {
        // Cleanup HRI components
        if (speechBubble != null)
        {
            speechBubble.SetActive(false);
        }
    }
}
```

### Example 2: Unity-ROS 2 Bridge Configuration
```json
{
  "unity_ros2_bridge": {
    "connection": {
      "ip": "127.0.0.1",
      "port": 8888,
      "timeout": 5000
    },
    "topics": {
      "robot_state": {
        "name": "/robot_state",
        "type": "std_msgs/String",
        "qos_profile": "default",
        "publish_rate": 10
      },
      "joint_states": {
        "name": "/joint_states",
        "type": "sensor_msgs/JointState",
        "qos_profile": "default",
        "subscribe_rate": 50
      },
      "command": {
        "name": "/command",
        "type": "std_msgs/String",
        "qos_profile": "default",
        "publish_rate": 30
      },
      "camera": {
        "name": "/camera/image_raw",
        "type": "sensor_msgs/Image",
        "qos_profile": "sensor_data",
        "subscribe_rate": 30
      }
    },
    "services": {
      "navigation": {
        "name": "/navigate_to_pose",
        "type": "nav_msgs/GetPlan",
        "timeout": 10000
      },
      "manipulation": {
        "name": "/grasp_object",
        "type": "object_manipulation_msgs/GraspObject",
        "timeout": 15000
      }
    },
    "actions": {
      "move_base": {
        "name": "/move_base",
        "type": "move_base_msgs/MoveBaseAction",
        "feedback_rate": 10
      }
    },
    "robot_model": {
      "urdf_path": "Assets/Models/humanoid.urdf",
      "joint_mapping": {
        "l_shoulder_pitch": "LeftShoulder_Pitch",
        "l_shoulder_roll": "LeftShoulder_Roll",
        "l_elbow": "LeftElbow",
        "r_shoulder_pitch": "RightShoulder_Pitch",
        "r_shoulder_roll": "RightShoulder_Roll",
        "r_elbow": "RightElbow",
        "l_hip_yaw": "LeftHip_Yaw",
        "l_hip_roll": "LeftHip_Roll",
        "l_hip_pitch": "LeftHip_Pitch",
        "l_knee": "LeftKnee",
        "l_ankle_pitch": "LeftAnkle_Pitch",
        "l_ankle_roll": "LeftAnkle_Roll",
        "r_hip_yaw": "RightHip_Yaw",
        "r_hip_roll": "RightHip_Roll",
        "r_hip_pitch": "RightHip_Pitch",
        "r_knee": "RightKnee",
        "r_ankle_pitch": "RightAnkle_Pitch",
        "r_ankle_roll": "RightAnkle_Roll",
        "neck": "Neck"
      }
    },
    "hri_settings": {
      "speech_recognition": {
        "enabled": true,
        "language": "en-US",
        "confidence_threshold": 0.7
      },
      "gesture_recognition": {
        "enabled": true,
        "models_path": "Assets/MLModels/gesture_recognition.tflite"
      },
      "emotion_detection": {
        "enabled": true,
        "models_path": "Assets/MLModels/emotion_detection.tflite"
      }
    }
  }
}
```

### Example 3: VR Interaction Manager
```csharp
// VRInteractionManager.cs - Manages VR-based interaction with humanoid robot
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR;

public class VRInteractionManager : MonoBehaviour
{
    [Header("VR Controllers")]
    public Transform leftController;
    public Transform rightController;
    public Transform head;

    [Header("Interaction Objects")]
    public GameObject interactionPointer;
    public LayerMask interactionLayer;
    public float maxInteractionDistance = 5.0f;

    [Header("Robot Interaction")]
    public Transform robotTransform;
    public float followDistance = 2.0f;
    public float followSpeed = 5.0f;

    [Header("UI Elements")]
    public GameObject vrMenu;
    public Canvas interactionCanvas;

    private InputDevice leftControllerDevice;
    private InputDevice rightControllerDevice;
    private bool isInteracting = false;
    private GameObject currentInteractionObject = null;

    void Start()
    {
        InitializeVRControllers();
        SetupVRInteraction();
    }

    void InitializeVRControllers()
    {
        leftControllerDevice = InputDevices.GetDeviceAtXRNode(XRNode.LeftHand);
        rightControllerDevice = InputDevices.GetDeviceAtXRNode(XRNode.RightHand);
    }

    void SetupVRInteraction()
    {
        if (interactionPointer != null)
        {
            interactionPointer.SetActive(false);
        }

        if (vrMenu != null)
        {
            vrMenu.SetActive(false);
        }
    }

    void Update()
    {
        UpdateVRControllers();
        HandleVRInteractions();
        UpdateRobotFollowing();
    }

    void UpdateVRControllers()
    {
        // Update controller positions (this happens automatically with XR Rig)
        // But we can add additional logic here if needed
    }

    void HandleVRInteractions()
    {
        // Handle right controller interaction
        if (rightControllerDevice.TryGetFeatureValue(CommonUsages.triggerButton, out bool triggerPressed))
        {
            if (triggerPressed && !isInteracting)
            {
                StartInteraction();
            }
            else if (!triggerPressed && isInteracting)
            {
                EndInteraction();
            }
        }

        // Handle menu button
        if (rightControllerDevice.TryGetFeatureValue(CommonUsages.menuButton, out bool menuPressed))
        {
            if (menuPressed)
            {
                ToggleVRMenu();
            }
        }

        // Handle teleportation or movement
        if (leftControllerDevice.TryGetFeatureValue(CommonUsages.primaryButton, out bool primaryPressed))
        {
            if (primaryPressed)
            {
                HandleTeleportation();
            }
        }
    }

    void StartInteraction()
    {
        isInteracting = true;

        // Enable interaction pointer
        if (interactionPointer != null)
        {
            interactionPointer.SetActive(true);
        }

        // Raycast to find interaction target
        RaycastHit hit;
        Vector3 controllerForward = rightController.forward;
        Vector3 controllerPosition = rightController.position;

        if (Physics.Raycast(controllerPosition, controllerForward, out hit, maxInteractionDistance, interactionLayer))
        {
            currentInteractionObject = hit.collider.gameObject;

            // Highlight the object
            HighlightObject(currentInteractionObject, true);

            // Handle specific interaction based on object type
            HandleObjectInteraction(currentInteractionObject);
        }
    }

    void EndInteraction()
    {
        isInteracting = false;

        // Disable interaction pointer
        if (interactionPointer != null)
        {
            interactionPointer.SetActive(false);
        }

        // Remove highlight from object
        if (currentInteractionObject != null)
        {
            HighlightObject(currentInteractionObject, false);
            currentInteractionObject = null;
        }
    }

    void HighlightObject(GameObject obj, bool highlight)
    {
        Renderer renderer = obj.GetComponent<Renderer>();
        if (renderer != null)
        {
            Material material = renderer.material;
            if (highlight)
            {
                // Store original color
                Color originalColor = material.color;

                // Apply highlight
                material.color = Color.yellow;

                // Store original color for later restoration
                obj.GetComponent<ObjectHighlighter>().SetOriginalColor(originalColor);
            }
            else
            {
                // Restore original color
                ObjectHighlighter highlighter = obj.GetComponent<ObjectHighlighter>();
                if (highlighter != null)
                {
                    material.color = highlighter.GetOriginalColor();
                }
            }
        }
    }

    void HandleObjectInteraction(GameObject obj)
    {
        // Handle different types of objects
        InteractableObject interactable = obj.GetComponent<InteractableObject>();
        if (interactable != null)
        {
            interactable.Interact();
        }
        else if (obj.CompareTag("Robot"))
        {
            // Direct robot interaction
            DirectRobotInteraction(obj);
        }
        else if (obj.CompareTag("Command"))
        {
            // Execute command
            ExecuteCommand(obj.name);
        }
    }

    void DirectRobotInteraction(GameObject robot)
    {
        // Implement direct robot control through VR
        Debug.Log("Direct robot interaction initiated");

        // Example: Make robot look at user
        if (robotTransform != null && head != null)
        {
            Vector3 direction = (head.position - robotTransform.position).normalized;
            robotTransform.LookAt(head.position);
        }
    }

    void ExecuteCommand(string commandName)
    {
        // Execute specific command based on object name
        switch (commandName.ToLower())
        {
            case "wave":
                SendRobotCommand("wave");
                break;
            case "dance":
                SendRobotCommand("dance");
                break;
            case "follow":
                SendRobotCommand("follow");
                break;
            case "stop":
                SendRobotCommand("stop");
                break;
        }
    }

    void SendRobotCommand(string command)
    {
        // Send command to robot via ROS 2 or other communication method
        Debug.Log($"Sending command to robot: {command}");

        // This would typically involve sending a ROS 2 message
        // For example: ros2Connector.SendSpeechCommand(command);
    }

    void ToggleVRMenu()
    {
        if (vrMenu != null)
        {
            vrMenu.SetActive(!vrMenu.activeSelf);
        }
    }

    void HandleTeleportation()
    {
        // Handle teleportation to where the left controller is pointing
        RaycastHit hit;
        Vector3 controllerForward = leftController.forward;
        Vector3 controllerPosition = leftController.position;

        if (Physics.Raycast(controllerPosition, controllerForward, out hit, maxInteractionDistance, interactionLayer))
        {
            // Teleport player to hit point
            // This would typically be handled by XR Rig teleportation system
            Debug.Log($"Teleporting to: {hit.point}");
        }
    }

    void UpdateRobotFollowing()
    {
        // Make robot follow the VR user at a comfortable distance
        if (robotTransform != null && head != null)
        {
            Vector3 targetPosition = head.position - head.forward * followDistance;
            targetPosition.y = robotTransform.position.y; // Keep same height

            robotTransform.position = Vector3.Lerp(
                robotTransform.position,
                targetPosition,
                followSpeed * Time.deltaTime
            );
        }
    }

    // Helper class for object highlighting
    [System.Serializable]
    public class ObjectHighlighter
    {
        private Color originalColor;

        public void SetOriginalColor(Color color)
        {
            originalColor = color;
        }

        public Color GetOriginalColor()
        {
            return originalColor;
        }
    }
}
```

## System-Level Architecture Perspective
### Unity in the Humanoid Robotics Ecosystem
Unity serves as a bridge between different components of the humanoid robotics system, providing visualization, interaction, and simulation capabilities:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Real Robot    │◄──▶│   ROS 2 Bridge  │◄──▶│     Unity       │───▶│   Human User    │
│   (Hardware)    │    │   (Communication│    │   (HRI System)  │    │   (VR/AR/Screen)│
│                 │    │   & Control)    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    └─────────────────┘
│   Sensors &     │    │   Message       │    │   Visualization │
│   Actuators     │    │   Exchange      │    │   & Interaction │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Integration Architecture
The Unity-ROS 2 integration architecture involves several key components:

- **ROS 2 Bridge**: Facilitates communication between Unity and ROS 2 nodes
- **Message Mapping**: Translates ROS 2 messages to Unity components and vice versa
- **Visualization Layer**: Renders robot state and environment in Unity
- **Interaction Layer**: Handles user input and translates to robot commands
- **Simulation Layer**: Provides physics and environment simulation capabilities

### VR/AR Extension Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   VR/AR Device  │    │  Unity HRI      │    │   Robot Control │
│   (Headset,     │───▶│   System        │───▶│   System        │
│   Controllers)  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    └─────────────────┘
│   Position/     │    │   Immersive     │
│   Orientation   │    │   Interaction   │
│   Data          │    │   Interface     │
└─────────────────┘    └─────────────────┘
```

## Practical Reasoning
### When to Use Unity for HRI
Unity is particularly valuable for humanoid robotics when:

1. **Immersive Visualization**: Creating 3D visualizations of robot state and environment
2. **VR/AR Interfaces**: Developing virtual or augmented reality interfaces for robot control
3. **Social Interaction**: Prototyping social behaviors and interaction patterns
4. **Training Environments**: Creating safe, repeatable environments for HRI research
5. **User Experience**: Developing intuitive interfaces for non-expert users

### Unity vs Other HRI Frameworks
**Unity Advantages:**
- Rich 3D visualization capabilities
- Extensive asset ecosystem
- Cross-platform support (VR, AR, mobile, desktop)
- Game engine physics and animation systems
- Large developer community

**Unity Considerations:**
- Performance overhead compared to native applications
- Licensing costs for commercial use
- Less real-time control precision than dedicated robotics frameworks
- Learning curve for robotics engineers

### Best Practices for Unity HRI Development
1. **Performance Optimization**: Optimize for real-time interaction, especially in VR
2. **Intuitive Design**: Create interfaces that feel natural to human users
3. **Safety Considerations**: Include safety mechanisms in VR/AR interfaces
4. **Cross-Platform Compatibility**: Design for multiple interaction modalities
5. **Modular Architecture**: Keep Unity components modular for easy integration

## Failure Modes and Debugging
### Common Unity-ROS 2 Integration Issues
1. **Connection Failures**:
   - Cause: Network configuration or firewall issues
   - Solution: Check IP addresses, ports, and firewall settings

2. **Message Serialization Issues**:
   - Cause: Mismatched message formats between Unity and ROS 2
   - Solution: Verify message types and field names match exactly

3. **Performance Degradation**:
   - Cause: High message rates or complex visualization
   - Solution: Implement message throttling and LOD systems

4. **Synchronization Problems**:
   - Cause: Timing differences between Unity and ROS 2 systems
   - Solution: Implement proper time synchronization

### VR-Specific Issues
1. **Motion Sickness**:
   - Cause: Latency or frame rate issues
   - Solution: Maintain 90+ FPS and minimize latency

2. **Tracking Errors**:
   - Cause: Sensor occlusion or calibration issues
   - Solution: Implement robust tracking fallbacks

3. **Controller Mapping Issues**:
   - Cause: Platform-specific input handling
   - Solution: Use Unity's XR Input System consistently

### Debugging Tools and Techniques
```csharp
// Unity HRI Debugging Helper
using UnityEngine;

public class HRIDebugger : MonoBehaviour
{
    public bool showDebugInfo = true;
    public float updateInterval = 1.0f;

    private float lastUpdateTime = 0;
    private int frameCount = 0;
    private float fps = 0;
    private float avgLatency = 0;

    void Update()
    {
        frameCount++;

        if (Time.time - lastUpdateTime >= updateInterval)
        {
            fps = frameCount / (Time.time - lastUpdateTime);
            frameCount = 0;
            lastUpdateTime = Time.time;

            if (showDebugInfo)
            {
                Debug.Log($"HRI System Stats - FPS: {fps:F1}, Latency: {avgLatency:F2}ms");
            }
        }

        // Check for Unity-ROS 2 connection
        CheckROS2Connection();
    }

    void CheckROS2Connection()
    {
        ROS2Connector connector = FindObjectOfType<ROS2Connector>();
        if (connector != null)
        {
            // Check connection status and log if needed
        }
    }

    void OnGUI()
    {
        if (showDebugInfo)
        {
            GUI.Label(new Rect(10, 10, 200, 20), $"FPS: {fps:F1}");
            GUI.Label(new Rect(10, 30, 200, 20), $"Connected: {IsROS2Connected()}");
        }
    }

    bool IsROS2Connected()
    {
        ROS2Connector connector = FindObjectOfType<ROS2Connector>();
        return connector != null; // Simplified check
    }
}
```

## Exercises
### Beginner Exercises
1. **Basic Unity Scene**: Create a simple Unity scene with a humanoid robot model
2. **UI Integration**: Add basic UI elements for robot control in Unity
3. **ROS 2 Connection**: Establish a basic connection between Unity and ROS 2

### Intermediate Exercises
4. **VR Controller Setup**: Configure VR controllers to interact with a Unity robot model
5. **Gesture Recognition**: Implement basic gesture recognition in Unity
6. **HRI Interface**: Create an intuitive human-robot interaction interface

### Advanced Exercises
7. **Full VR HRI System**: Develop a complete VR-based interaction system for humanoid robots
8. **Multi-modal Interaction**: Combine speech, gesture, and touch interaction in Unity
9. **Performance Optimization**: Optimize Unity HRI system for real-time performance
10. **Cross-platform Deployment**: Deploy HRI system to multiple platforms (desktop, VR, mobile)

## Multiple Choice Questions (MCQs)
**Question 1:** What is the primary advantage of using Unity for humanoid robot HRI?
  - a) Better physics simulation
  - b) Rich 3D visualization and interaction capabilities
  - c) Lower computational requirements
  - d) Real-time control precision
  - **Answer: b) Rich 3D visualization and interaction capabilities**
  - **Explanation:** Unity excels at creating immersive, visually rich interfaces for human-robot interaction.

**Question 2:** Which Unity component is essential for VR-based robot control?
  - a) Rigidbody
  - b) XR Interaction Manager
  - c) NavMesh Agent
  - d) Animator
  - **Answer: b) XR Interaction Manager**
  - **Explanation:** XR Interaction Manager handles VR controller input and interaction with 3D objects.

**Question 3:** What does ROS 2 bridge enable in Unity HRI systems?
  - a) Physics simulation
  - b) Communication between Unity and ROS 2 nodes
  - c) Animation blending
  - d) Audio processing
  - **Answer: b) Communication between Unity and ROS 2 nodes**
  - **Explanation:** ROS 2 bridge facilitates message exchange between Unity and ROS 2 systems.

**Question 4:** Which interaction modality is best supported by Unity for HRI?
  - a) Text-based commands only
  - b) Voice commands only
  - c) Multi-modal interaction (visual, audio, gesture)
  - d) Physical touch only
  - **Answer: c) Multi-modal interaction (visual, audio, gesture)**
  - **Explanation:** Unity supports multiple interaction modalities including visual, audio, and gesture recognition.

**Question 5:** What is a key consideration when developing VR interfaces for robot control?
  - a) High latency is acceptable
  - b) Maintaining high frame rates to prevent motion sickness
  - c) Complex graphics are always preferred
  - d) Minimal user feedback is ideal
  - **Answer: b) Maintaining high frame rates to prevent motion sickness**
  - **Explanation:** VR systems need high frame rates (90+ FPS) to prevent user discomfort.

**Question 6:** Which Unity feature is most important for realistic humanoid animation?
  - a) Particle systems
  - b) Animator Controller with Mecanim
  - c) Lighting system
  - d) Audio system
  - **Answer: b) Animator Controller with Mecanim**
  - **Explanation:** Animator Controller with Mecanim provides advanced character animation capabilities.

**Question 7:** What is the typical update rate for VR HRI systems to ensure user comfort?
  - a) 30 FPS
  - b) 60 FPS
  - c) 90+ FPS
  - d) 120+ FPS
  - **Answer: c) 90+ FPS**
  - **Explanation:** VR systems typically require 90+ FPS to ensure user comfort and reduce motion sickness.

**Question 8:** Which Unity system is used for handling different XR platforms (Oculus, SteamVR, etc.)?
  - a) Unity Multiplayer
  - b) XR Management
  - c) Unity Cloud Build
  - d) Unity Analytics
  - **Answer: b) XR Management**
  - **Explanation:** XR Management provides a unified interface for different XR platforms.

**Question 9:** What is a key benefit of using Unity for HRI prototyping?
  - a) Lower hardware requirements
  - b) Rapid iteration and visual feedback
  - c) Better real-time performance
  - d) Simplified networking
  - **Answer: b) Rapid iteration and visual feedback**
  - **Explanation:** Unity allows rapid prototyping with immediate visual feedback for HRI concepts.

**Question 10:** Which Unity component would you use for detecting user gaze direction in HRI?
  - a) Line Renderer
  - b) Raycast from camera forward vector
  - c) Particle System
  - d) Light component
  - **Answer: b) Raycast from camera forward vector**
  - **Explanation:** Raycasting from the camera's forward vector detects where the user is looking.

## Chapter Summary
This chapter explored Unity-based human-robot interaction systems for humanoid robots, covering the integration of Unity with ROS 2, VR/AR interfaces, and multimodal interaction systems. The technical content included Unity-ROS 2 bridge implementation, humanoid robot control in Unity, VR interaction systems, and complete HRI examples. Practical considerations focused on when to use Unity for HRI, performance optimization, and cross-platform deployment. Unity provides powerful visualization and interaction capabilities that complement traditional robotics frameworks, enabling rich, immersive human-robot interaction experiences that are particularly valuable for humanoid robots where social interaction and intuitive control interfaces are important.

## Citations
1. Unity Technologies. (2023). "Unity for Robotics: Integration Guide." *Unity Documentation*. https://unity.com/solutions/industrial-automation/robotics
2. ROSIN Project. (2021). "ROS-Unity Integration Best Practices." *ROSIN Technical Report*.
3. Thomaz, A. L., & Breazeal, C. (2008). "Socially Guided Machine Learning for Human-Robot Interaction." *International Journal of Humanoid Robotics*.
4. ROS 2 Working Group. (2023). "Human-Robot Interaction Frameworks." *Open Robotics Technical Report*.
5. NVIDIA. (2022). "Isaac Sim vs Unity for Robotics Simulation." *NVIDIA Technical Report*.
6. PAL Robotics. (2021). "Humanoid Robot Interaction Interfaces." *PAL Technical Report*.
7. Boston Dynamics. (2020). "User Interfaces for Dynamic Humanoid Robots." *Technical Report*.
8. MIT Media Lab. (2019). "Social Robotics and Human-Robot Interaction Design." *MIT Technical Report*.

## Recent Developments
- **Unity Robotics Package**: Official Unity package for ROS 2 integration with improved performance
- **XR Interaction Toolkit 2.0**: Enhanced VR/AR interaction capabilities for robotics applications
- **Real-time Ray Tracing**: Integration of real-time ray tracing for photorealistic robot visualization
- **Cloud Rendering**: Remote rendering capabilities for complex HRI scenarios
- **AI Integration**: Direct integration with ML-Agents for learning-based HRI behaviors
- **Multi-user Support**: Shared virtual environments for collaborative HRI research
- **Haptic Feedback**: Enhanced haptic feedback systems for more immersive interaction
- **5G Integration**: Low-latency communication for remote HRI applications