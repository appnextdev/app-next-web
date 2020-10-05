const sensorTestSuit = 
{
    overall: (name, sensor) =>
    {
        function invokeTestFail(error)
        {
            notify(name + '-ready', false)
            notify(name + '-position', false)
            notify(name + '-cancel', false)
            notify(name + '-error', false)

            output(name + '-output', error)
        }

        sensor.onCancel = error => 
        {
            if (error.name == 'feature terminated')
            {
                notify(name + '-cancel', true)
            }
            else
            {
                invokeTestFail(error)
            }
        }

        sensor.onData = accelerometer => 
        {
            output(name + '-output', accelerometer, true)

            notify(name + '-position', true)
        }

        sensor.onError = error =>
        {
            if (error.name == 'test')
            {
                notify(name + '-error', true)
            }
            else
            {
                invokeTestFail(error)
            }
        }

        sensor.onPending = () => notify(name + '-wait', true)

        sensor.onReady = () => 
        {
            notify(name + '-ready', true)

            setTimeout(() => sensor.stop(), 3000)

            //throw error()
        }

        sensor.start() 
    }
}